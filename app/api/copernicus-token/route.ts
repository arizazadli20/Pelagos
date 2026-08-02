import { NextResponse } from 'next/server';

export async function GET() {
    const url = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token";
    
    const params = new URLSearchParams();
    params.append('client_id', 'sh-9f26ba13-eeb0-4310-8887-89348ba6f164');
    params.append('client_secret', '6tlvBtOAhHYmU9ROQ4by7t4ZVMJlSL5b');
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
