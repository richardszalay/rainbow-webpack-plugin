import { createMockEnvironment } from "./helpers";

import { parseItem } from "../node-rainbow";

import * as webpack from "webpack";
import { RainbowPlugin, RainbowPluginOptions } from "..";
import * as tapable from "tapable";

import { getUuid, enqueueUuid, getDate, setDate } from "./mocks";

jest.mock("uuid/v4", () => () => getUuid());

const { AsyncSeriesHook } = tapable;

describe("getFileTypeInfo options", () => {

    let compilation: webpack.compilation.Compilation;

    beforeEach(() => {
        compilation = createMockEnvironment("parent1");

        compilation.assets["test.js"] = {
            source: () => "function foo(bar) { return bar; }"
        };

        enqueueUuid("aaa", "bbb");
        Date.now = () => new Date("2018-01-02T03:04:05Z").valueOf();
    });

    it("can change the item name", async () => {
        const options: RainbowPluginOptions = {
            getFileTypeInfo(filename, info) {
                info.name += "2";
                return info;
            }
        };

        const promise = new Promise((res, rej) => new RainbowPlugin(options).emit(compilation, res))
            .then(() => parseItem(compilation.assets["test.yml"].source().toString()));

        await expect(promise)
            .resolves.toMatchObject({
                Path: "/content/Parent1/test2"
            });
    });

    it("can change the template id", async () => {
        const options: RainbowPluginOptions = {
            getFileTypeInfo(filename, info) {
                info.templateId = "aaabbbccc";
                return info;
            }
        };

        const promise = new Promise((res, rej) => new RainbowPlugin(options).emit(compilation, res))
            .then(() => parseItem(compilation.assets["test.yml"].source().toString()));

        await expect(promise)
            .resolves.toMatchObject({
                Template: "aaabbbccc"
            });
    });

    it("can change the mimetype", async () => {
        const options: RainbowPluginOptions = {
            getFileTypeInfo(filename, info) {
                info.mimeType = "text/custom";
                return info;
            }
        };

        const item = await new Promise((res, rej) => new RainbowPlugin(options).emit(compilation, res))
            .then(() => parseItem(compilation.assets["test.yml"].source().toString()));

        const field = item.SharedFields.find((f) => f.Hint === "Mime Type");

        expect(field!.Value).toEqual("text/custom");
    });

    it("can change the icon", async () => {
        const options: RainbowPluginOptions = {
            getFileTypeInfo(filename, info) {
                info.icon = "/icon.png";
                return info;
            }
        };

        const item = await new Promise((res, rej) => new RainbowPlugin(options).emit(compilation, res))
            .then(() => parseItem(compilation.assets["test.yml"].source().toString()));

        const field = item.SharedFields.find((f) => f.Hint === "__Icon");

        expect(field!.Value).toEqual("/icon.png");
    });

    it("can change the extension", async () => {
        const options: RainbowPluginOptions = {
            getFileTypeInfo(filename, info) {
                info.extension = "css";
                return info;
            }
        };

        const item = await new Promise((res, rej) => new RainbowPlugin(options).emit(compilation, res))
            .then(() => parseItem(compilation.assets["test.yml"].source().toString()));

        const field = item.SharedFields.find((f) => f.Hint === "Extension");

        expect(field!.Value).toEqual("css");
    });
});
