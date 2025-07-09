// Endpoints interface
export interface LensEndpoints {
  // Data endpoints
  fetch_config: string;
  query: string;
  update_data: string;
  query_relation_options: string;
  
  // View endpoints
  list_views: string;
  create_view: string;
  update_view: string;
  delete_view: string;
  
  // Custom attributes endpoints
  list_custom_attributes: string;
  create_custom_attribute: string;
  update_custom_attribute: string;
  delete_custom_attribute: string;
}

/**
 * Constructs all Lens endpoints from a query name and base URL
 * Returns a strictly typed interface
 */
export function createEndpoints(query: string, baseUrl: string): LensEndpoints {
  // Remove trailing slash from baseUrl
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  
  return {
    // Data endpoints
    fetch_config: `${cleanBaseUrl}/${query}/_config`,
    query: `${cleanBaseUrl}/${query}/_read`,
    update_data: `${cleanBaseUrl}/${query}/_update`,
    query_relation_options: `${cleanBaseUrl}/${query}/_read_relation_options`,
    
    // View endpoints
    list_views: `${cleanBaseUrl}/lcs_views/_read`,
    create_view: `${cleanBaseUrl}/lcs_views/_create`,
    update_view: `${cleanBaseUrl}/lcs_views/_update`,
    delete_view: `${cleanBaseUrl}/lcs_views/_delete`,
    
    // Custom attributes endpoints
    list_custom_attributes: `${cleanBaseUrl}/lcs_custom_attributes/_read`,
    create_custom_attribute: `${cleanBaseUrl}/lcs_custom_attributes/_create`,
    update_custom_attribute: `${cleanBaseUrl}/lcs_custom_attributes/_update`,
    delete_custom_attribute: `${cleanBaseUrl}/lcs_custom_attributes/_delete`,
  };
}