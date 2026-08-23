import { NextResponse } from 'next/server';

export async function GET() {
    const clientId = process.env.COPERNICUS_CLIENT_ID;
    const clientSecret = process.env.COPERNICUS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.json(
            { error: "Copernicus credentials not configured. Set COPERNICUS_CLIENT_ID and COPERNICUS_CLIENT_SECRET." },
            { status: 500 }
        );
    }

    const url = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token";

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'client_credentials');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Copernicus Error:", errorText);
            return NextResponse.json({ error: "Copernicus API failed" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Local API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
