import * as webpack from "webpack";

export function createMockEnvironment(fixture: string) {
  return {
    outputOptions: {
      path: __dirname + `/fixtures/${fixture}`
    },
    assets: {},
    errors: [],
    warnings: []
  } as any as webpack.compilation.Compilation;
}

export interface EventBinding {
    name: string;
    handler: () => {};
}

export class PluginEnvironment {
    private events: EventBinding[] = [];

    constructor() {
      this.events = [];
    }

    getEnvironmentStub() {
      return {
        plugin: (name: string, handler: () => {}) => {
          this.events.push({
            name,
            handler,
          });
        },
      };
    }

    getEventBindings() {
      return this.events;
    }
  }

export function compile(compiler: webpack.ICompiler) {
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                return reject(err);
            }
            resolve(stats);
        });
    });
}

export function createCompiler(options = {}) {
    const compiler = webpack({
      bail: true,
      cache: false,
      entry: `${__dirname}/fixtures/entry.js`,
      output: {
        path: `${__dirname}/dist`,
        filename: "[name].[chunkhash].js",
        chunkFilename: "[id].[name].[chunkhash].js",
      },
      ...options,
    });

    // compiler.outputFileSystem = new MemoryFileSystem();
    return compiler;
  }
