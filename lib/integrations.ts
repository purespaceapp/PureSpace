async function integrationsRequest(
  action: string,
  body: Record<string, any> = {}
) {
  const response = await fetch("/api/integrations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      ...body,
    }),
  });

  if (!response.ok) {
    throw new Error(
      "Integration request failed"
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.error ||
        "Integration request failed"
    );
  }

  return result.data;
}

export async function getIntegration(
  ownerId: number
) {
  return await integrationsRequest("get", {
    ownerId,
  });
}

export async function saveIntegration(
  integration: {
    owner_id: number;
    provider: string;
    connected: boolean;
    api_key: string;
    account_id: string;
    organization_id: string;
  }
) {
  return await integrationsRequest("save", {
    integration,
  });
}
