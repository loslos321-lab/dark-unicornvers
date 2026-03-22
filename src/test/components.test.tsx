import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AgentChat } from "../components/AgentChat";
import { Terminal } from "../components/Terminal";
import { NeuralSandbox } from "../components/NeuralSandbox";

// Mock XSS utility
vi.mock("../lib/xss", () => ({
  escapeHtml: vi.fn((str: string) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;")),
}));

describe("AgentChat Component", () => {
  const mockOnSendMessage = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render initial welcome message", () => {
    render(
      <AgentChat
        messages={[]}
        loading={false}
        error={null}
        onSendMessage={mockOnSendMessage}
        onClear={mockOnClear}
        isReady={true}
      />
    );

    expect(screen.getByText("Welcome to OpenClaw")).toBeInTheDocument();
    expect(screen.getByText("100% Privacy. 100% Local. 100% Yours.")).toBeInTheDocument();
  });

  it("should render messages correctly", () => {
    const messages = [
      { role: "user", content: "Hello agent" },
      { role: "assistant", content: "Hello! How can I help?" },
    ];

    render(
      <AgentChat
        messages={messages}
        loading={false}
        error={null}
        onSendMessage={mockOnSendMessage}
        onClear={mockOnClear}
        isReady={true}
      />
    );

    expect(screen.getByText("[USER]")).toBeInTheDocument();
    expect(screen.getByText("[ASSISTANT]")).toBeInTheDocument();
    expect(screen.getByText("Hello agent")).toBeInTheDocument();
    expect(screen.getByText("Hello! How can I help?")).toBeInTheDocument();
  });

  it("should show loading state", () => {
    render(
      <AgentChat
        messages={[]}
        loading={true}
        error={null}
        onSendMessage={mockOnSendMessage}
        onClear={mockOnClear}
        isReady={true}
      />
    );

    expect(screen.getByText("Thinking...")).toBeInTheDocument();
  });

  it("should show error message", () => {
    render(
      <AgentChat
        messages={[]}
        loading={false}
        error="Test error message"
        onSendMessage={mockOnSendMessage}
        onClear={mockOnClear}
        isReady={true}
      />
    );

    expect(screen.getByText(/Test error message/)).toBeInTheDocument();
  });

  it("should call onSendMessage when sending message", () => {
    render(
      <AgentChat
        messages={[]}
        loading={false}
        error={null}
        onSendMessage={mockOnSendMessage}
        onClear={mockOnClear}
        isReady={true}
      />
    );

    const input = screen.getByPlaceholderText(/Enter command or question/);
    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockOnSendMessage).toHaveBeenCalledWith("Test message");
  });

  it("should call onClear when clear button clicked", () => {
    const messages = [{ role: "user", content: "Test" }];

    render(
      <AgentChat
        messages={messages}
        loading={false}
        error={null}
        onSendMessage={mockOnSendMessage}
        onClear={mockOnClear}
        isReady={true}
      />
    );

    // Find the clear button by looking for buttons with the Trash icon
    const buttons = screen.getAllByRole("button");
    const clearButton = buttons.find(btn => btn.querySelector("svg"));
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(mockOnClear).toHaveBeenCalled();
    }
  });

  it("should disable input when not ready", () => {
    render(
      <AgentChat
        messages={[]}
        loading={false}
        error={null}
        onSendMessage={mockOnSendMessage}
        onClear={mockOnClear}
        isReady={false}
      />
    );

    const input = screen.getByPlaceholderText(/Agent initializing/);
    expect(input).toBeDisabled();
  });

  it("should show character count", () => {
    render(
      <AgentChat
        messages={[]}
        loading={false}
        error={null}
        onSendMessage={mockOnSendMessage}
        onClear={mockOnClear}
        isReady={true}
      />
    );

    expect(screen.getByText(/0 \/ 500/)).toBeInTheDocument();
  });

  it("should not send empty messages", () => {
    render(
      <AgentChat
        messages={[]}
        loading={false}
        error={null}
        onSendMessage={mockOnSendMessage}
        onClear={mockOnClear}
        isReady={true}
      />
    );

    const input = screen.getByPlaceholderText(/Enter command or question/);
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });
});

describe("Terminal Component", () => {
  const mockOnExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render terminal button when closed", () => {
    render(<Terminal onExecute={mockOnExecute} isReady={true} />);

    expect(screen.getByText("Terminal")).toBeInTheDocument();
  });

  it("should open terminal when button clicked", () => {
    render(<Terminal onExecute={mockOnExecute} isReady={true} />);

    const button = screen.getByText("Terminal");
    fireEvent.click(button);

    expect(screen.getByText("darkunicorn@root:~#")).toBeInTheDocument();
  });

  it("should execute help command", async () => {
    render(<Terminal onExecute={mockOnExecute} isReady={true} />);

    fireEvent.click(screen.getByText("Terminal"));

    const input = screen.getByPlaceholderText("Enter command...");
    fireEvent.change(input, { target: { value: "help" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText(/DARK UNICORN TERMINAL/)).toBeInTheDocument();
    });
  });

  it("should execute clear command", async () => {
    render(<Terminal onExecute={mockOnExecute} isReady={true} />);

    fireEvent.click(screen.getByText("Terminal"));

    const input = screen.getByPlaceholderText("Enter command...");
    fireEvent.change(input, { target: { value: "clear" } });
    fireEvent.keyDown(input, { key: "Enter" });

    // Terminal should be cleared
    await waitFor(() => {
      const outputs = screen.queryAllByText(/root@darkunicorn/);
      expect(outputs.length).toBeLessThanOrEqual(2); // Just input line
    });
  });

  it("should execute echo command", async () => {
    render(<Terminal onExecute={mockOnExecute} isReady={true} />);

    fireEvent.click(screen.getByText("Terminal"));

    const input = screen.getByPlaceholderText("Enter command...");
    fireEvent.change(input, { target: { value: "echo Hello World" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });
  });

  it("should execute stats command", async () => {
    mockOnExecute.mockResolvedValue({ documents: 5, chats: 2 });

    render(<Terminal onExecute={mockOnExecute} isReady={true} />);

    fireEvent.click(screen.getByText("Terminal"));

    const input = screen.getByPlaceholderText("Enter command...");
    fireEvent.change(input, { target: { value: "stats" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(mockOnExecute).toHaveBeenCalledWith("get_stats");
    });
  });

  it("should execute curl command with URL", async () => {
    mockOnExecute.mockResolvedValue({ status: 200, data: "OK" });

    render(<Terminal onExecute={mockOnExecute} isReady={true} />);

    fireEvent.click(screen.getByText("Terminal"));

    const input = screen.getByPlaceholderText("Enter command...");
    fireEvent.change(input, { target: { value: "curl https://example.com" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(mockOnExecute).toHaveBeenCalledWith("curl", {
        url: "https://example.com",
        method: "GET",
      });
    });
  });

  it("should show error for unknown command", async () => {
    mockOnExecute.mockRejectedValue(new Error("Unknown command"));

    render(<Terminal onExecute={mockOnExecute} isReady={true} />);

    fireEvent.click(screen.getByText("Terminal"));

    const input = screen.getByPlaceholderText("Enter command...");
    fireEvent.change(input, { target: { value: "unknowncommand" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Unknown command")).toBeInTheDocument();
    });
  });

  it("should support command history with arrow keys", () => {
    render(<Terminal onExecute={mockOnExecute} isReady={true} />);

    fireEvent.click(screen.getByText("Terminal"));

    const input = screen.getByPlaceholderText("Enter command...") as HTMLInputElement;

    // Type and execute command
    fireEvent.change(input, { target: { value: "echo test" } });
    fireEvent.keyDown(input, { key: "Enter" });

    // Press up arrow to recall
    fireEvent.keyDown(input, { key: "ArrowUp" });

    expect(input.value).toBe("echo test");
  });

  it("should support tab completion", () => {
    render(<Terminal onExecute={mockOnExecute} isReady={true} />);

    fireEvent.click(screen.getByText("Terminal"));

    const input = screen.getByPlaceholderText("Enter command...") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "he" } });
    fireEvent.keyDown(input, { key: "Tab" });

    expect(input.value).toBe("help");
  });

  it("should minimize terminal", () => {
    render(<Terminal onExecute={mockOnExecute} isReady={true} />);

    fireEvent.click(screen.getByText("Terminal"));
    expect(screen.getByPlaceholderText("Enter command...")).toBeInTheDocument();

    // Find and click minimize button
    const buttons = screen.getAllByRole("button");
    const minimizeButton = buttons.find((btn) => btn.querySelector("svg"));
    if (minimizeButton) {
      fireEvent.click(minimizeButton);
    }
  });

  it("should close terminal", () => {
    render(<Terminal onExecute={mockOnExecute} isReady={true} />);

    fireEvent.click(screen.getByText("Terminal"));
    expect(screen.getByPlaceholderText("Enter command...")).toBeInTheDocument();

    // Close and reopen
    const closeButtons = screen.getAllByRole("button");
    const closeButton = closeButtons[closeButtons.length - 1];
    fireEvent.click(closeButton);

    expect(screen.queryByPlaceholderText("Enter command...")).not.toBeInTheDocument();
  });

  it("should disable input when not ready", () => {
    render(<Terminal onExecute={mockOnExecute} isReady={false} />);

    fireEvent.click(screen.getByText("Terminal"));

    const input = screen.getByPlaceholderText("Initializing...");
    expect(input).toBeDisabled();
  });
});

describe("NeuralSandbox Component", () => {
  it("should render canvas", () => {
    const { container } = render(<NeuralSandbox thoughts={[]} isThinking={false} />);

    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("should show processing indicator when thinking", () => {
    render(<NeuralSandbox thoughts={[]} isThinking={true} />);

    expect(screen.getByText("⚡ Processing...")).toBeInTheDocument();
  });

  it("should not show processing indicator when not thinking", () => {
    render(<NeuralSandbox thoughts={[]} isThinking={false} />);

    expect(screen.queryByText("⚡ Processing...")).not.toBeInTheDocument();
  });

  it("should show neural activity label", () => {
    render(<NeuralSandbox thoughts={[]} isThinking={false} />);

    expect(screen.getByText(/Neural Activity Monitor/)).toBeInTheDocument();
  });

  it("should handle thoughts updates", () => {
    const { rerender } = render(<NeuralSandbox thoughts={["thought1"]} isThinking={true} />);

    rerender(<NeuralSandbox thoughts={["thought1", "thought2"]} isThinking={true} />);

    expect(screen.getByText(/Neural Activity Monitor/)).toBeInTheDocument();
  });

  it("should apply pulse animation when thinking", () => {
    render(<NeuralSandbox thoughts={[]} isThinking={true} />);

    const processingIndicator = screen.getByText("⚡ Processing...");
    expect(processingIndicator.className).toContain("animate-pulse");
  });
});
