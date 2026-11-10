import { Client } from "@elastic/elasticsearch";

export const elasticClient = new Client({
  node: process.env.ELASTIC_URL || "https://localhost:9200",
  auth: {
    apiKey: process.env.ELASTIC_API_KEY || "",
  },
});

export async function searchPrecedentDisputes(queryEmbedding: number[]) {
  const response = await elasticClient.search({
    index: "autosovereign-disputes",
    knn: {
      field: "contract_vector",
      query_vector: queryEmbedding,
      k: 3,
      num_candidates: 50,
    },
  });

  return response.hits.hits.map((hit) => hit._source);
}
