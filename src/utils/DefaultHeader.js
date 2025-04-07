export const DefaultHeader = async () => {   
    const headers = {
        "Content-Type": "application/json",
        "app-environment": "development",
        "device-name": "web_device",
        "device-id": "deviceId",
        "device-type": "web",
        "ip-address":"IPAddress",
        "os-version": "os",
    };
    return headers;
}