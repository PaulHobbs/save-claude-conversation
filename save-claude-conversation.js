(function() {
    // Function to get content of an artifact
    async function getArtifactContent(button) {
        button.click();
        console.log(button);
        await new Promise(r => setTimeout(r, 100)); // Wait 0.1s for content to load
        let content = document.querySelector('.language-plaintext')?.innerText ||
                      'Content not found';
        document.querySelector('button[aria-label="close"]')?.click();
        return content;
    }

    // Function to process a message and its artifacts
    async function processMessage(message) {
        let isUser = message.classList.contains('font-user-message');
        let prefix = isUser ? '**Human:** ' : '**Claude:** ';
        let text = message.innerText.trim();

        // Find and replace "Click to open text" with actual artifact content
        let artifactButtons = Array.from(message.querySelectorAll('button[aria-label="Preview contents"]'));
        for (let button of artifactButtons) {
            let artifactContent = await getArtifactContent(button);
            console.log(`message: ${message.innerText.trim().substr(0, 100)}`);
            // console.log(`artifact: ${artifactContent}`);
            text = text.replace("Click to open text", `\n\n#### Artifact:\n\n\`\`\`\n${artifactContent}\n\`\`\`\n--------------------------------------------------------------------------------`);
        }

        return prefix + '\n' + text;
    }

    // Get conversation with inlined artifacts
    async function getConversationWithArtifacts() {
        let messages = Array.from(document.querySelectorAll('.font-user-message, .font-claude-message'));
        let conversation = [];
        for (var i = 0; i < messages.length; i++) {
            conversation.push(await processMessage(messages[i]));
        }
        return conversation.join('\n\n');
    }

    // Main execution
    getConversationWithArtifacts().then(fullContent => {
        let blob = new Blob([fullContent], {type: 'text/plain'});
        let a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'claude_conversation_with_inline_artifacts.md';
        a.click();
    });
})();
