import type * as Ast from '@unified-latex/unified-latex-types'
import type { CmdEnvSuggestion } from './completion/completer/completerutils'
import type { CiteSuggestion } from './completion/completer/citation'
import type { GlossarySuggestion } from './completion/completer/glossary'
import type { ICompletionItem } from './completion/latex'

export interface FileCache {
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
