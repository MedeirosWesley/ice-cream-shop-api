/**
 * Unifica bairros e ruas duplicados dos clientes.
 *
 * Valores com a mesma chave normalizada (sem espaços extras, sem acento e sem
 * diferença de maiúsculas/minúsculas) passam a usar uma única grafia:
 * de preferência a com acento e, entre essas, a mais frequente.
 *
 * Faz backup automático em db/sql.sqlite.bak-merge-<timestamp> antes de alterar.
 * Rode com a API parada (o SQLite trava o arquivo durante a escrita).
 *
 *   npm run merge:addresses
 *   DB_PATH=caminho/para/copia.sqlite npm run merge:addresses   # outro banco
 */
import * as fs from 'fs';
import moment from 'moment';
import { DataSource } from 'typeorm';
import { env } from '../src/modules/config/env';
import { cleanDisplay, hasAccents, normalizeKey, toTitleCase } from '../src/modules/client/utils/address-normalize';

type AddressField = 'street' | 'neighborhood';
const FIELDS: AddressField[] = ['neighborhood', 'street'];

interface FieldStats {
  distinct: number;
  keys: number;
}

function pickCanonical(variants: Map<string, number>): string {
  // variants: grafia limpa -> quantidade de clientes
  const ranked = [...variants.entries()].sort(([a, countA], [b, countB]) => {
    const accentDiff = Number(hasAccents(b)) - Number(hasAccents(a));
    if (accentDiff !== 0) return accentDiff;
    if (countA !== countB) return countB - countA;
    const upperDiff = Number(/^\p{Lu}/u.test(b)) - Number(/^\p{Lu}/u.test(a));
    if (upperDiff !== 0) return upperDiff;
    return a.localeCompare(b, 'pt-BR');
  });
  const best = ranked[0][0];
  // Tudo minúsculo (ou tudo maiúsculo) vira Title Case.
  if (best === best.toLocaleLowerCase('pt-BR') || best === best.toLocaleUpperCase('pt-BR')) {
    return toTitleCase(best);
  }
  return best;
}

async function stats(ds: DataSource, field: AddressField): Promise<FieldStats> {
  const rows: { value: string }[] = await ds.query(
    `SELECT DISTINCT "${field}" AS value FROM client WHERE "${field}" IS NOT NULL`,
  );
  return {
    distinct: rows.length,
    keys: new Set(rows.map((r) => normalizeKey(r.value))).size,
  };
}

async function mergeField(ds: DataSource, field: AddressField): Promise<number> {
  const rows: { value: string; total: number }[] = await ds.query(
    `SELECT "${field}" AS value, COUNT(*) AS total FROM client WHERE "${field}" IS NOT NULL GROUP BY "${field}"`,
  );

  // chave -> (valor bruto -> quantidade)
  const groups = new Map<string, Map<string, number>>();
  for (const row of rows) {
    const key = normalizeKey(row.value);
    if (!groups.has(key)) groups.set(key, new Map());
    groups.get(key).set(row.value, Number(row.total));
  }

  let updated = 0;
  await ds.transaction(async (manager) => {
    for (const rawValues of groups.values()) {
      const cleanedCounts = new Map<string, number>();
      for (const [raw, count] of rawValues) {
        const cleaned = cleanDisplay(raw);
        cleanedCounts.set(cleaned, (cleanedCounts.get(cleaned) ?? 0) + count);
      }
      const canonical = pickCanonical(cleanedCounts);

      for (const [raw, count] of rawValues) {
        if (raw === canonical) continue;
        await manager.query(`UPDATE client SET "${field}" = ? WHERE "${field}" = ?`, [canonical, raw]);
        updated += count;
        console.log(`  [${field}] "${raw}" -> "${canonical}" (${count})`);
      }
    }
  });
  return updated;
}

async function main() {
  const dbPath = env.dbPath;
  if (!fs.existsSync(dbPath)) {
    console.error(`Banco não encontrado: ${dbPath}`);
    process.exit(1);
  }

  const backupPath = `${dbPath}.bak-merge-${moment().format('YYYYMMDD-HHmmss')}`;
  fs.copyFileSync(dbPath, backupPath);
  console.log(`Backup criado em ${backupPath}`);

  const ds = new DataSource({ type: 'sqlite', database: dbPath, synchronize: false, entities: [] });
  await ds.initialize();

  try {
    const before: Record<string, FieldStats> = {};
    for (const field of FIELDS) before[field] = await stats(ds, field);

    console.log('');
    console.log('Unificando endereços...');
    const updated: Record<string, number> = {};
    for (const field of FIELDS) updated[field] = await mergeField(ds, field);

    const after: Record<string, FieldStats> = {};
    for (const field of FIELDS) after[field] = await stats(ds, field);

    console.log('');
    console.log('--------- Merge concluído ---------');
    for (const field of FIELDS) {
      const label = field === 'neighborhood' ? 'Bairros' : 'Ruas';
      console.log(
        `${label.padEnd(8)} distintos: ${before[field].distinct} -> ${after[field].distinct}` +
        ` (chaves: ${before[field].keys}); clientes atualizados: ${updated[field]}`,
      );
    }
  } finally {
    await ds.destroy();
  }
}

main().catch((error) => {
  console.error('Erro no merge de endereços:', error);
  process.exit(1);
});
