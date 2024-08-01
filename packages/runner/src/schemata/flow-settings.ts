import { resolve } from "node:path";
import * as v from "valibot";

import { type Printer, chalk } from "@codemod-com/printer";

export const DEFAULT_EXCLUDE_PATTERNS = [
  "*.d.ts",
  "node_modules/",
  ".next/",
  "dist/",
  "build/",
];
export const DEFAULT_VERSION_CONTROL_DIRECTORIES = [
  ".git/",
  ".svn/",
  ".hg/",
  ".bzr/",
  "_darcs/",
  "_MTN/",
  "_FOSSIL_",
  ".fslckout",
  ".view/",
];
export const DEFAULT_INPUT_DIRECTORY_PATH = process.cwd();
export const DEFAULT_ENABLE_PRETTIER = false;
export const DEFAULT_ENABLE_LOGGING = false;
export const DEFAULT_CACHE = true;
export const DEFAULT_INSTALL = true;
export const DEFAULT_USE_JSON = false;
export const DEFAULT_THREAD_COUNT = 4;
export const DEFAULT_DRY_RUN = false;
export const DEFAULT_TELEMETRY = true;

export const flowSettingsSchema = v.object({
  _: v.array(v.string()),
  include: v.optional(v.array(v.string())),
  exclude: v.optional(v.array(v.string()), []),
  target: v.optional(v.string()),
  files: v.optional(v.array(v.string())),
  dry: v.optional(v.boolean(), DEFAULT_DRY_RUN),
  format: v.optional(v.boolean(), DEFAULT_ENABLE_PRETTIER),
  cache: v.optional(v.boolean(), DEFAULT_CACHE),
  install: v.optional(v.boolean(), DEFAULT_INSTALL),
  json: v.optional(v.boolean(), DEFAULT_USE_JSON),
  threads: v.optional(v.pipe(v.number(), v.minValue(0)), DEFAULT_THREAD_COUNT),
});

export type FlowSettings = Omit<
  v.InferOutput<typeof flowSettingsSchema>,
  "target"
> & {
  target: string;
};

export const parseFlowSettings = (
  input: unknown,
  printer: Printer,
): FlowSettings => {
  const flowSettings = v.parse(flowSettingsSchema, input);

  const positionalPassedTarget = flowSettings._.at(1);
  const argTarget = flowSettings.target;

  let target: string;
  if (positionalPassedTarget && argTarget) {
    printer.printConsoleMessage(
      "info",
      chalk.yellow(
        "Both positional and argument target options are passed. Defaulting to the argument target option...",
      ),
    );

    target = argTarget;
  } else {
    target =
      positionalPassedTarget ?? argTarget ?? DEFAULT_INPUT_DIRECTORY_PATH;
  }

  return {
    ...flowSettings,
    target: resolve(target),
  };
};
