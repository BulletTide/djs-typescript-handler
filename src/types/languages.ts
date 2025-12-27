export interface CommandLanguage {
    description?: string;
    usage?: string;
    examples?: string;
}

export interface HelpLanguage {
    description: string;
    usage: string;
    examples: string;
    names: {
        usage: string;
        aliases: string;
        examples: string;
        noCategory: string;
        cooldown: string;
        isDisabled: string;
        commandCategories: string;
        categoriesHelp: string;
        categoriesName: string;
        categories: Record<string, string>;
    };
}

export interface Languages {
    help: HelpLanguage;
    [commandName: string]: CommandLanguage | HelpLanguage;
}