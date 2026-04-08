import type autoprefixer from 'autoprefixer';
import type { Options as HtmlMinifierOptions } from 'html-minifier-terser';
import type { ObfuscatorOptions } from 'javascript-obfuscator';

import cssnanoPlugin from 'cssnano';
import { JSX } from 'react';

export namespace WorkspaceScaffold {
  export type Type = 'file' | 'folder';

  export type Item<T extends Type = Type> = T extends Type
    ? {
        name: string;
        type: T;
        content?: T extends 'file' ? string | JSX.Element : Item[];
      }
    : never;

  export type Scaffold = Item[];
}

export type BuildFindMap = Record<string, string[]>;
export type BuildResultMap<Find extends BuildFindMap = BuildFindMap> = Record<
  string,
  keyof Find | (keyof Find)[]
>;

/**
 * Workspace config schema, defines the structure of the workspace configuration file (tixyel.config.{ts,.js,.json,.jsonc})
 * Not provided options will fall back to default values defined in the CLI
 */
export interface WorkspaceConfig<Find extends BuildFindMap = BuildFindMap> {
  /**
   * Search options for locating widget files in the workspace
   */
  search?: {
    /**
     * Maximum directory depth to search for widget files
     */
    maxDepth?: number;
    /**
     * Folders and files to ignore during search for widget files, supports glob patterns
     */
    ignore?: string[];
  };

  /**
   * Metadata applied to all widgets in the workspace, can be overridden by individual widget metadata
   */
  metadata?: {
    name?: string;
    author?: string;
    clientId?: string;
    description?: string;
    tags?: string[];
  };

  /**
   * Directory structure configuration for widget entry files, output files, and compacted files
   */
  dirs?: {
    /**
     * Directory where widget entry files are located, supports glob patterns
     */
    entry?: string;
    /**
     * Directory where built widget files will be output, supports glob patterns
     */
    output?: string;
    /**
     * Directory where shared files for multiple widgets will be located, supports glob patterns
     */
    shared?: string;
    /**
     * Directory where compacted widget files will be output, supports glob patterns
     */
    extension?: string;
  };

  /**
   * Scaffold structure to create when generating a new widget, defines the files and folders to create with their content (string or JSX.Element)
   */
  scaffold?: {
    single?: WorkspaceScaffold.Item[];
    multiple?: WorkspaceScaffold.Item[];
  };

  /**
   * Build configuration for widget builds, including options for parallel builds, verbose logging, file finding patterns, build results mapping, and obfuscation settings for JavaScript, CSS, and HTML
   */
  build?: {
    /**
     * Run builds in parallel to improve build times, especially for larger workspaces with many widgets
     */
    parallel?: boolean;
    /**
     * Enable verbose output during build process for debugging and insight into build steps, file processing, and potential issues
     */
    verbose?: boolean;

    /**
     * Patterns for finding widget files to build, defined as a mapping of build names to glob patterns or arrays of glob patterns that specify the location of widget files in the workspace
     */
    find?: Find;
    /**
     * Directory for shared files used in multiple widget builds, allowing for common assets or code to be shared across widgets without duplication in each widget's build output
     */
    shared?: Find;
    /**
     * Mapping of output files to find keys, defines how the found widget files should be mapped to output file names, allowing for flexible naming conventions and organization of built widget files
     */
    result?: BuildResultMap<Find>;
    /**
     * Mapping of widgetIO output files to find keys, similar to the result mapping but specifically for widgetIO output files, allowing for separate handling and organization of widgetIO builds
     */
    widgetIO?: BuildResultMap<Find>;

    /**
     * Obfuscation and minification settings for JavaScript, CSS, and HTML files during the build process, allowing for enhanced security and reduced file sizes for production builds
     */
    obfuscation?: {
      /**
       * HTML minification options, defined using the Options type from the html-minifier-terser package, allowing for various HTML minification techniques such as removing comments, collapsing whitespace, and minifying inline CSS and JavaScript to create smaller HTML files for production
       */
      html?: HtmlMinifierOptions;
      /**
       * CSS minification options, allowing for configuration of CSS minification using cssnano and autoprefixer, including options for removing nesting, adding vendor prefixes, and optimizing CSS for production
       */
      css?: {
        /**
         * Remove nesting rules from CSS, which can help reduce file size and improve compatibility with older browsers that do not support CSS nesting
         */
        removeNesting?: boolean;
        /**
         * Autoprefixer options, defined using the Options type from the autoprefixer package, allowing for automatic addition of vendor prefixes to CSS rules based on browser compatibility data, ensuring that the CSS works across different browsers and versions
         */
        autoprefixer?: autoprefixer.Options;
        /**
         * cssnano options, defined using the Options type from the cssnano package, allowing for various CSS optimization techniques such as merging rules, reducing colors, and removing whitespace to create smaller CSS files for production
         */
        cssnano?: cssnanoPlugin.Options;
      };
      /**
       * JavaScript obfuscation options, defined using the ObfuscatorOptions type from the javascript-obfuscator package, allowing for various obfuscation techniques such as control flow flattening, string array encoding, and dead code injection to make the JavaScript code more difficult to reverse engineer
       */
      javascript?: ObfuscatorOptions;
    };

    /**
     * Optional regular expression for matching HTML files during the build process, allowing for more flexible identification of HTML files beyond just file extensions, such as matching specific naming conventions or patterns in the file names to determine which files should be treated as HTML during the build
     * The result should be match[1] containing the HTML content to be processed, typically by extracting the content within the <body> tags for further processing and building of the widget
     */
    htmlRegex?: RegExp;
  };
}
