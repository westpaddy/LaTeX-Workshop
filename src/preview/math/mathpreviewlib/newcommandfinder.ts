import * as vscode from 'vscode'
import * as path from 'path'
import { lw } from '../../../lw'
import { stripCommentsAndVerbatim } from '../../../utils/utils'

const logger = lw.log('Preview', 'Math')

export async function findProjectNewCommand(ctoken?: vscode.CancellationToken): Promise<string> {
    const configuration = vscode.workspace.getConfiguration('latex-workshop')
    const newCommandFile = configuration.get('hover.preview.newcommand.newcommandFile') as string
    let commandsInConfigFile = ''
    if (newCommandFile !== '') {
        commandsInConfigFile = await loadNewCommandFromConfigFile(newCommandFile)
    }

    if (!configuration.get('hover.preview.newcommand.parseTeXFile.enabled')) {
        return commandsInConfigFile
    }
    let commands: string[] = []
    for (const tex of lw.cache.getIncludedTeX()) {
        if (ctoken?.isCancellationRequested) {
            return ''
        }
        await lw.cache.wait(tex)
        const content = lw.cache.get(tex)?.content
        if (content === undefined) {
            continue
        }
        commands = commands.concat(findNewCommand(content))
    }
    return commandsInConfigFile + '\n' + postProcessNewCommands(commands.join(''))
}

function postProcessNewCommands(commands: string): string {
    return commands.replace(/\\providecommand/g, '\\newcommand')
                    .replace(/\\newcommand\*/g, '\\newcommand')
                    .replace(/\\renewcommand\*/g, '\\renewcommand')
                    .replace(/\\DeclarePairedDelimiter{(\\[a-zA-Z]+)}{([^{}]*)}{([^{}]*)}/g, '\\newcommand{$1}[2][]{#1$2 #2 #1$3}')
}

async function loadNewCommandFromConfigFile(newCommandFile: string) {
    let commandsString: string | undefined = ''
    if (newCommandFile === '') {
        return commandsString
    }
    let newCommandFileAbs: string
    if (path.isAbsolute(newCommandFile)) {
        newCommandFileAbs = newCommandFile
    } else {
        if (lw.root.file.path === undefined) {
            await lw.root.find()
        }
        const rootDir = lw.root.dir.path
        if (rootDir === undefined) {
            logger.log(`Cannot identify the absolute path of new command file ${newCommandFile} without root file.`)
            return ''
        }
        newCommandFileAbs = path.join(rootDir, newCommandFile)
    }
    commandsString = lw.file.read(newCommandFileAbs)
    if (commandsString === undefined) {
        logger.log(`Cannot read file ${newCommandFileAbs}`)
        return ''
    }
    commandsString = commandsString.replace(/^\s*$/gm, '')
    commandsString = postProcessNewCommands(commandsString)
    return commandsString
}

function findNewCommand(content: string): string[] {
    const commands: string[] = []
    const regex = /(\\(?:(?:(?:(?:re)?new|provide)command|DeclareMathOperator)(\*)?{\\[a-zA-Z]+}(?:\[[^[\]{}]*\])*{.*})|\\(?:def\\[a-zA-Z]+(?:#[0-9])*{.*})|\\DeclarePairedDelimiter{\\[a-zA-Z]+}{[^{}]*}{[^{}]*})/gm
    const noCommentContent = stripCommentsAndVerbatim(content)
    let result: RegExpExecArray | null
    do {
        result = regex.exec(noCommentContent)
        if (result) {
            let command = result[1]
            if (result[2]) {
                command = command.replace('*', '')
            }
            commands.push(command)
        }
    } while (result)
    return commands
}
