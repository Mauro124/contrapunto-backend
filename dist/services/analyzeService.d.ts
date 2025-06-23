export interface ProductInsights {
    summary: string;
    pros: string[];
    cons: string[];
    emotionalTone: string;
    sentimentDistribution: {
        positive: number;
        neutral: number;
        negative: number;
    };
}
export declare const getProductInsights: (url: string) => Promise<ProductInsights>;
