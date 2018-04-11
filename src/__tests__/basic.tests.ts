import { PluginEnvironment, createCompiler, createMockEnvironment } from "./helpers";

import * as webpack from "webpack";
import { RainbowPlugin } from "..";
import * as tapable from "tapable";

import { getUuid, enqueueUuid, getDate, setDate } from "./mocks";

jest.mock("uuid/v4", () => () => getUuid());

const { AsyncSeriesHook } = tapable;

describe("default options", () => {

    it("creates item if it doesn't exist", async () => {
        const compilation = createMockEnvironment("parent1");

        compilation.assets["test.js"] = {
            source: () => "function foo(bar) { return bar; }"
        };

        enqueueUuid("aaa", "bbb");
        Date.now = () => new Date("2018-01-02T03:04:05Z").valueOf();

        const promise = new Promise((res, rej) => new RainbowPlugin().emit(compilation, res));

        await expect(promise.then(() => compilation.assets["test.yml"].source().toString()))
            .resolves.toMatchSnapshot("new");

        await expect(promise.then(() => compilation.assets["test.js"]))
            .resolves.toBeUndefined();
    });

    it("updates item if it already exists", async () => {
        const compilation = createMockEnvironment("parent1");

        compilation.assets["child1.js"] = {
            source: () => "function foo(bar) { return bar; }"
        };

        enqueueUuid("aaa", "bbb");
        Date.now = () => new Date("2018-01-02T03:04:05Z").valueOf();

        const promise = new Promise((res, rej) => new RainbowPlugin().emit(compilation, res));

        await expect(promise.then(() => compilation.assets["child1.yml"].source().toString()))
            .resolves.toMatchSnapshot("exists");

        await expect(promise.then(() => compilation.assets["child1.js"]))
            .resolves.toBeUndefined();
    });
});
