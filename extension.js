
const vscode = require('vscode')
const { extract } = require('./lib/expander')
const emmet = require('emmet');
const systemSnippets = require('emmet/lib/snippets.json')
const snippets = require('./snippets/index');

const TABSTOP = /\${[^{}]+}/g

function activate(context) {
  emmet.loadSystemSnippets(systemSnippets);
  emmet.loadSnippets(snippets);
  const disposable = vscode.commands.registerCommand('uxcore.emmet', function() {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }
    const document = editor.document
    const selection = editor.selection
    const { line, character } = selection.active // current cursor position
    const curLine = document.lineAt(line).text

    let { abbr, abbrStart, abbrEnd } = extract(curLine, character)
    try {
      if (abbr) {
        const output = emmet.expandAbbreviation(abbr, 'jsx');
        if (!TABSTOP.test(output)) {
          return editor.edit(edit => {
              // edit.replace doesn't work well here, it messes up cursor position/selection
              edit.delete(new vscode.Range(line, abbrStart, line, abbrEnd))
              edit.insert(new vscode.Position(line, abbrStart), output)
            })
            .then(() => {
              const cursor = selection.active // current cursor position after edit
              editor.revealRange(new vscode.Range(line, abbrStart, cursor.line, cursor.character))
            })
        } else {
          if (typeof editor.insertSnippet === 'function') {
            let snippet = new vscode.SnippetString(output)
            return editor.edit(edit => {
                edit.delete(new vscode.Range(line, abbrStart, line, abbrEnd))
              })
              .then(() => editor.insertSnippet(snippet, new vscode.Position(line, abbrStart)))
          } else {
            return editor.edit(edit => {
                edit.delete(new vscode.Range(line, abbrStart, line, abbrEnd))
                edit.insert(new vscode.Position(line, abbrStart), output.replace(TABSTOP, ''))
              })
              .then(() => {
                const cursor = selection.active // current cursor position after edit
                editor.revealRange(new vscode.Range(line, abbrStart, cursor.line, cursor.character))
              })
          }
        }
      } else {
        return vscode.window.showInformationMessage('[uxcore-emmet] Nothing to parse')
      }
    } catch (e) {
      console.error('[uxcore-emmet]', e)
      console.error({ abbr })
      vscode.window.showErrorMessage('[uxcore-emmet] Failed to parse: ' + abbr)
    }
  })

  context.subscriptions.push(disposable)
}
exports.activate = activate

function deactivate() {}
exports.deactivate = deactivate