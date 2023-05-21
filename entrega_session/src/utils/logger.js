import winston from "winston";

const customLevelOpt = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    debug: 4,
  },
  colors: {
    fatal: "red",
    error: "yellow",
    warning: "cyan",
    info: "green",
    debug: "blue",
  },
};

const isProduction = process.env.NODE_ENV === "PRODUCTION";

const transports = [
  new winston.transports.Console({
    level: "info",
    format: winston.format.combine(
      winston.format.colorize({ color: customLevelOpt.colors }),
      winston.format.simple()
    ),
  }),
];

if (isProduction) {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "warning",
      format: winston.format.simple(),
    }),
    new winston.transports.File({
      filename: "logs/info.log",
      level: "info",
      format: winston.format.simple(),
    }),
    new winston.transports.File({
      filename: "logs/warning.log",
      level: "warning",
      format: winston.format.simple(),
    })
  );
}

const logger = winston.createLogger({
  levels: customLevelOpt.levels,
  transports,
});

export const winstonLogger = (req, res, next) => {
  req.logger = logger;
  try {
    req.logger.info(
      `[${req.method}] ${req.url} - ${new Date().toLocaleTimeString()}`
    );
  } catch (error) {
    req.logger.error(error);
  }

  next();
};
