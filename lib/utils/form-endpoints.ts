import type { FormEndpoints } from "@lens2/types/form";

export function createFormEndpoints(
  baseUrl: string,
  mutator: string
): FormEndpoints {
  const baseEndpoint = `${baseUrl}/${mutator}`;

  return {
    fetch_config: `${baseEndpoint}/_config`,
    baseEndpoint: baseEndpoint,
    query_relation_options: `${baseEndpoint}/_read_relation_options`,
  };
}
