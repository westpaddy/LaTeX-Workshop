import type * as vscode from 'vscode'
import type * as Ast from '@unified-latex/unified-latex-types'
import type { CmdEnvSuggestion } from './completion/completer/completerutils'
import type { CiteSuggestion } from './completion/completer/citation'
import type { GlossarySuggestion } from './completion/completer/glossary'
import type { ICompletionItem } from './completion/latex'

export type FileCache = {
    /** The raw file path of this Cache. */
    filePath: string,
    /** Cached content of file. Dirty if opened in vscode, disk otherwise */
    content: string,
    /** Cached trimmed content of `content`. */
    contentTrimmed: string,
    /** Completion items */
    elements: {
        /** \ref{} items */
        reference?: ICompletionItem[],
        /** \gls items */
        glossary?: GlossarySuggestion[],
        /** \begin{} items */
        environment?: CmdEnvSuggestion[],
        /** \cite{} items from \bibitem definition */
        bibitem?: CiteSuggestion[],
        /** command items */
        command?: CmdEnvSuggestion[],
        /** \usepackage{}, a dictionary whose key is package name and value is the options */
        package?: {[packageName: string]: string[]}
    },
    /** The sub-files of the LaTeX file. They should be tex or plain files */
    children: {
        /** The index of character sub-content is inserted */
        index: number,
        /** The path of the sub-file */
        filePath: string
    }[],
    /** The array of the paths of `.bib` files referenced from the LaTeX file */
    bibfiles: Set<string>,
    /** A dictionary of external documents provided by `\externaldocument` of
     * `xr` package. The value is its prefix `\externaldocument[prefix]{*}` */
    external: {[filePath: string]: string},
    /** The AST of this file, generated by unified-latex */
    ast?: Ast.Root
}

export type StepQueue = {
    /**
     * The {@link Step}s in the current recipe.
     */
    steps: Step[],
    /**
     * The {@link Step}s in the next recipe to be executed after the current
     * ones.
     */
    nextSteps: Step[]
}

export type ProcessEnv = {
    [key: string]: string | undefined
}

export type Tool = {
    name: string,
    command: string,
    args?: string[],
    env?: ProcessEnv
}

export type Recipe = {
    name: string,
    tools: (string | Tool)[]
}

export type RecipeStep = Tool & {
    rootFile: string,
    recipeName: string,
    timestamp: number,
    index: number,
    isExternal: false,
    isRetry: boolean,
    isSkipped: boolean
}

export type ExternalStep = Tool & {
    rootFile?: string,
    recipeName: 'External',
    timestamp: number,
    index: number,
    isExternal: true,
    cwd: string
}

export type Step = RecipeStep | ExternalStep

export type ViewerMode = 'browser' | 'tab' | 'external' | 'legacy' | 'singleton'

export type SyncTeXRecordToPDF = {
    page: number,
    x: number,
    y: number,
    indicator: boolean
}

export type SyncTeXRecordToTeX = {
    input: string,
    line: number,
    column: number
}

export interface LaTeXLinter {
    readonly linterDiagnostics: vscode.DiagnosticCollection,
    getName(): string,
    lintRootFile(rootPath: string): Promise<void>,
    lintFile(document: vscode.TextDocument): Promise<void>,
    parseLog(log: string, filePath?: string): void
}

export enum TeXElementType { Environment, Command, Section, SectionAst, SubFile, BibItem, BibField }

export type TeXElement = {
    readonly type: TeXElementType,
    readonly name: string,
    label: string,
    readonly lineFr: number,
    lineTo: number,
    readonly filePath: string,
    children: TeXElement[],
    parent?: TeXElement,
    appendix?: boolean
}

export type TeXMathEnv = { texString: string, range: vscode.Range, envname: string }
