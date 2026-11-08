// Configuração lida das variáveis de ambiente, com os valores de sempre como
// padrão. Assim dá para trocar porta, impressora ou taxa sem recompilar o main.exe.
export const env = {
  port: Number(process.env.PORT ?? 3000),
  dbPath: process.env.DB_PATH ?? 'db/sql.sqlite',
  // Em produção, prefira DB_SYNCHRONIZE=false: o synchronize pode recriar
  // tabelas quando uma entidade muda.
  dbSynchronize: process.env.DB_SYNCHRONIZE !== 'false',
  // 'usb' (padrão) ou 'serial' (Bluetooth via porta COM).
  printerUseUsb: process.env.PRINTER_INTERFACE !== 'serial',
  printerSerialPort: process.env.PRINTER_SERIAL_PORT ?? 'COM4',
  // Só a taxa inicial: depois que alguém altera pelo app, vale a da tabela setting.
  deliveryFee: Number(process.env.DELIVERY_FEE ?? 2),
  storeName: process.env.STORE_NAME ?? 'Kimolek',
};
