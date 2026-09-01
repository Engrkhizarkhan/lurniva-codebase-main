import { nodeConfig } from "@lurniva/eslint-config/node";

export default [...nodeConfig, { ignores: ["generated/**"] }];
