// *****************************************************************************
// NOTE:
// THIS IS THE SOURCE FOR bookmarklet.txt
// IT WILL NOT WORK AS A BOOKMARKLET DUE TO COMMENTS
// USE bookmarklet.txt INSTEAD
// *****************************************************************************

(function() {
    // Get content of an artifact by clicking a button
    async function getArtifactContent(button) {
        button.click();
        await new Promise(r => setTimeout(r, 100)); // Wait 0.1s for content to load
        let content = document.querySelector('.language-plaintext')?.innerText ||
                      'Content not found';
        document.querySelector('button[aria-label="close"]')?.click();
        return content;
    }

    // Process a message and its artifacts
    async function processMessage(message) {
        let isUser = message.classList.contains('font-user-message');
        let prefix = isUser ? '**Human:** ' : '**Claude:** ';

        function processMarkdown(element) {
            if (element.nodeType === Node.TEXT_NODE) {
                return element.textContent;
            }

            const markdownRules = {
                'P': () => toMarkdown(element) + '\n\n',
                'STRONG': () => `**${toMarkdown(element)}**`,
                'EM': () => `*${toMarkdown(element)}*`,
                'CODE': () => `\`${toMarkdown(element)}\``,
                'PRE': () => {
                    let codeBlock = element.querySelector('code');
                    let language = codeBlock.className.replace('language-', '');
                    return `\`\`\`${language}\n${codeBlock.textContent}\n\`\`\`\n\n`;
                },
                'OL': () => Array.from(element.children).map((li, index) => 
                    `${index + 1}. ${toMarkdown(li)}`
                ).join('\n') + '\n\n',
                'UL': () => Array.from(element.children).map(li => 
                    `- ${toMarkdown(li)}`
                ).join('\n') + '\n\n',
                'BLOCKQUOTE': () => `> ${toMarkdown(element)}\n\n`,
                'A': () => `[${toMarkdown(element)}](${element.href})`,
                'H1': () => `# ${toMarkdown(element)}\n\n`,
                'H2': () => `## ${toMarkdown(element)}\n\n`,
                'H3': () => `### ${toMarkdown(element)}\n\n`,
                'DIV': () => toMarkdown(element),
                'OPTION': () => '',
                'BR': () => '\n'
            };

            return (markdownRules[element.tagName] || (() => toMarkdown(element)))();
        }


	let toMarkdown = (node) => Array.from(node.childNodes).map(node => processMarkdown(node)).join('');

	let text = toMarkdown(message);
        // Find and replace "Click to open text" with actual artifact content
        const artifactButtons = Array.from(message.querySelectorAll('button[aria-label="Preview contents"]'));
        for (let button of artifactButtons) {
            let artifactContent = await getArtifactContent(button);
            text = text.replace("Click to open text", `\n\n#### Artifact:\n\n\`\`\`\n${artifactContent}\n\`\`\`\n--------------------------------------------------------------------------------`);
        }

        return prefix + '\n' + text.trim();
    }

    // Exports the conversation as a markdown file for download.
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
        const title = (
          document.querySelector('button[data-testid="chat-menu-trigger"]') ||
          document.querySelector('button[testid="chat-menu-trigger"]')
        ).textContent;
        a.download = formattedDate + '_' + title + '.md'; 
        a.click();
    });
})();
