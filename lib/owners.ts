async function ownerRequest(
  action: string,
  body: Record<string, any> = {}
) {
  const response = await fetch("/api/owners", {
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
    throw new Error("Owner request failed");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Owner request failed");
  }

  return result.data;
}

export async function getOwners() {
  return (await ownerRequest("list")) ?? [];
}

export async function loginOwner(
  email: string,
  password: string
) {
  const response = await fetch("/api/owner-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const result = await response.json();

  return result.owner ?? null;
}

export async function acceptOwnerTerms(
  ownerId: number,
  termsVersion: string
) {
  return await ownerRequest("accept-terms", {
    ownerId,
    termsVersion,
  });
}