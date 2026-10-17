/**
 * Backfill dos totais dos pedidos já existentes.
 *
 * ATENÇÃO: recalcula usando os preços ATUAIS dos produtos — pedidos antigos
 * são reavaliados a preço de hoje. FAÇA BACKUP de db/sql.sqlite antes de rodar,
 * e rode com a API parada (o SQLite trava o arquivo durante a escrita).
 *
 *   npm run backfill:totals                            # histórico inteiro
 *   npm run backfill:totals -- 2026-01-01 2026-01-31   # só o período
 */
import { NestFactory } from '@nestjs/core';
import moment from 'moment';
import { AppModule } from '../src/app.module';
import { OrderService } from '../src/modules/order/order.service';

const DATE_FORMAT = 'YYYY-MM-DD';

function fail(message: string): never {
  console.error(message);
  console.error('');
  console.error('Uso:');
  console.error('  npm run backfill:totals                            # histórico inteiro');
  console.error('  npm run backfill:totals -- 2026-01-01 2026-01-31   # só o período');
  process.exit(1);
}

function parsePeriod(args: string[]): { startDate?: Date; endDate?: Date } {
  if (args.length === 0) {
    return {};
  }

  if (args.length !== 2) {
    fail(`Informe as duas datas (início e fim) ou nenhuma. Recebi ${args.length}.`);
  }

  const [rawStart, rawEnd] = args;

  const start = moment(rawStart, DATE_FORMAT, true);
  if (!start.isValid()) {
    fail(`Data inicial inválida: "${rawStart}". Use o formato ${DATE_FORMAT}.`);
  }

  const end = moment(rawEnd, DATE_FORMAT, true);
  if (!end.isValid()) {
    fail(`Data final inválida: "${rawEnd}". Use o formato ${DATE_FORMAT}.`);
  }

  if (end.isBefore(start)) {
    fail(`A data final (${rawEnd}) é anterior à inicial (${rawStart}).`);
  }

  // O dia final entra inteiro, mesma convenção do endpoint de relatório.
  return {
    startDate: start.startOf('day').toDate(),
    endDate: end.endOf('day').toDate(),
  };
}

async function main() {
  const { startDate, endDate } = parsePeriod(process.argv.slice(2));

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const orderService = app.get(OrderService);

    const periodo = startDate
      ? `${moment(startDate).format(DATE_FORMAT)} a ${moment(endDate).format(DATE_FORMAT)}`
      : 'histórico inteiro';

    console.log(`Iniciando backfill dos totais (${periodo})...`);
    const started = Date.now();

    const result = await orderService.recalculateAllTotals({
      startDate,
      endDate,
      batchSize: 200,
      onProgress: (processed, total) => {
        console.log(`  ${processed}/${total} pedidos processados`);
      },
    });

    const seconds = ((Date.now() - started) / 1000).toFixed(1);

    console.log('');
    console.log('--------- Backfill concluído ---------');
    console.log(`Período:          ${periodo}`);
    console.log(`Processados:      ${result.processed}`);
    console.log(`Atualizados:      ${result.updated}`);
    console.log(`Falhas:           ${result.failed}`);
    console.log(`Pedidos sem itens: ${result.emptyOrders}`);
    console.log(`Soma total:       R$${result.sum.toFixed(2)}`);
    console.log(`Tempo:            ${seconds}s`);
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('Erro no backfill:', error);
  process.exit(1);
});
