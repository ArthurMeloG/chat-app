export const fetchConversations = async (jwt: string, callback: () => any, errorCallback: () => void) => {
    try {
        const response = await fetch("http://localhost:8080/chats", {
            headers: {
                Authorization: `Bearer ${jwt}`,
                "Content-Type": "application/json",
            },
        })

        if (response.ok) {
            const data = await response.json()
            return data;
        } else {
            errorCallback();
        }
    } catch (error) {
        console.log(error)
    } finally {
        callback();
    }
}