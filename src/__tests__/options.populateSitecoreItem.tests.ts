import { createMockEnvironment } from "./helpers";

import { parseItem } from "../node-rainbow";

import * as webpack from "webpack";
import RainbowPlugin, { RainbowPluginOptions } from "..";
import * as tapable from "tapable";

import { getUuid, enqueueUuid, getDate, setDate } from "./mocks";

jest.mock("uuid/v4", () => () => getUuid());

const { AsyncSeriesHook } = tapable;

describe("populateSitecoreItem options", () => {

    let compilation: webpack.compilation.Compilation;

    beforeEach(() => {
        compilation = createMockEnvironment("parent1");

        compilation.assets["test.js"] = {
            source: () => "function foo(bar) { return bar; }"
        };

        enqueueUuid("aaa", "bbb");
        Date.now = () => new Date("2018-01-02T03:04:05Z").valueOf();
    });

    it("can override file info properties", async () => {
        const options: RainbowPluginOptions = {
            getFileTypeInfo(filename, info) {
                info.name += "2";
                return info;
            },

            populateSitecoreItem(item) {
                item.Path += "2";
            }
        };

        const promise = new Promise((res, rej) => new RainbowPlugin(options).emit(compilation, res))
            .then(() => parseItem(compilation.assets["test.yml"].source().toString()));

        await expect(promise)
            .resolves.toMatchObject({
                Path: "/content/Parent1/test22"
            });
    });

    it("can add fields", async () => {
        const options: RainbowPluginOptions = {
            populateSitecoreItem(item) {
                item.SharedFields.push({
                    ID: "111222",
                    Hint: "Custom",
                    Value: "Value"
                });
            }
        };

        const result = await new Promise((res, rej) => new RainbowPlugin(options).emit(compilation, res))
            .then(() => parseItem(compilation.assets["test.yml"].source().toString()));

        const field = result.SharedFields.find((f) => f.Hint === "Custom");

        await expect(field)
            .toMatchObject({
                ID: "111222",
                Hint: "Custom",
                Value: "Value"
            });
    });
});
