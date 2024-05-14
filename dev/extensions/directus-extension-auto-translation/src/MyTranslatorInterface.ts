export interface MyTranslatorInterface {

    init(): Promise<void>;

    translate(text: string, source_language: string, destination_language: string): Promise<any>;

    getUsage(): Promise<any>;

    getExtra(): Promise<any>;
}
