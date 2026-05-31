import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	schema: "graphql/schema.graphql",
	documents: "graphql/operations.graphql",
	generates: {
		"app/generated/graphql/client/": {
			preset: "client",
		},
		"app/generated/graphql/server-types.ts": {
			plugins: ["typescript", "typescript-resolvers"],
			config: {
				contextType: "@/app/api/graphql/route#GraphQLContext",
				useTypeImports: true,
			},
		},
	},
};

export default config;
