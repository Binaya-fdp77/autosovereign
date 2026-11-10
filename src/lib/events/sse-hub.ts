type Client = {
  id: number;
  controller: ReadableStreamDefaultController;
};

class SSEHub {
  private clients: Client[] = [];

  addClient(client: Client) {
    this.clients.push(client);
  }

  removeClient(id: number) {
    this.clients = this.clients.filter((c) => c.id !== id);
  }

  broadcast(event: string, data: any) {
    const payload = "event: " + event + "\ndata: " + JSON.stringify(data) + "\n\n";
    const encoder = new TextEncoder();
    const encoded = encoder.encode(payload);

    this.clients.forEach((client) => {
      try {
        client.controller.enqueue(encoded);
      } catch (err) {
        console.error("Failed to push SSE to client", err);
      }
    });
  }
}

export const sseHub = new SSEHub();
