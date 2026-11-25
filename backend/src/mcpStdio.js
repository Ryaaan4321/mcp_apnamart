process.env.MCP_STDIO = 'true';

await import('./config/env.js');
const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
const { createMcpServer } = await import('./mcp/index.js');

const mcpServer = createMcpServer();
const transport = new StdioServerTransport();

await mcpServer.connect(transport);
console.error('[ApnaMart] MCP Stdio Server running and listening for JSON-RPC messages.');
