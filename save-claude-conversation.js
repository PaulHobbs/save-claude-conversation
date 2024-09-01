(function() {
    // Function to get content of an artifact
    async function getArtifactContent(button) {
        button.click();
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

        // Function to process markdown elements
        function processMarkdown(element) {
            if (element.nodeType === Node.TEXT_NODE) {
                return element.textContent;
            }

            switch (element.tagName) {
                case 'P':
                    return toMarkdown(element) + '\n\n';
                case 'STRONG':
                    return `**${toMarkdown(element)}**`;
                case 'EM':
                    return `*${toMarkdown(element)}*`;
                case 'CODE':
                    return `\`${toMarkdown(element)}\``;
                case 'PRE':
                    let codeBlock = element.querySelector('code');
                    let language = codeBlock.className.replace('language-', '');
                    return `\`\`\`${language}\n${codeBlock.textContent}\n\`\`\`\n\n`;
                case 'OL':
                    return Array.from(element.children).map((li, index) => 
                        `${index + 1}. ${toMarkdown(li)}`
                    ).join('\n') + '\n\n';
                case 'UL':
                    return Array.from(element.children).map(li => 
                        `- ${toMarkdown(li)}`
                    ).join('\n') + '\n\n';
                case 'BLOCKQUOTE':
                    return `> ${toMarkdown(textContent)}\n\n`;
                case 'A':
                    return `[${toMarkdown(element)}](${element.href})`;
                case 'H1':
                    return `# ${toMarkdown(element)}\n\n`;
                case 'H2':
                    return `## ${toMarkdown(element)}\n\n`;
                case 'H3':
                    return `### ${toMarkdown(element)}\n\n`;
                case 'DIV':
                    return toMarkdown(element)
		case 'OPTION':
                    return ''
		case 'BR':
                    return '\n'
                default:
                    console.log(element);
                    console.log(element.tagName);
                    debug;
                    return toMarkdown(element);
            }
        }

	toMarkdown = (node) => Array.from(node.childNodes).map(node => processMarkdown(node)).join('');

	const text = toMarkdown(message);
        // Find and replace "Click to open text" with actual artifact content
        const artifactButtons = Array.from(message.querySelectorAll('button[aria-label="Preview contents"]'));
        for (let button of artifactButtons) {
            let artifactContent = await getArtifactContent(button);
            text = text.replace("Click to open text", `\n\n#### Artifact:\n\n\`\`\`\n${artifactContent}\n\`\`\`\n--------------------------------------------------------------------------------`);
        }

        return prefix + '\n' + text.trim();
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
	const formattedDate = (new Date()).toISOString().split('T')[0];
        const title = document.querySelector('button[data-testid="chat-menu-trigger"]').textContent;
        a.download = formattedDate + '_' + title + '.md'; 
        a.click();
    });
})();
