import { IReviewProvider } from '../interfaces/IReviewProvider';
export declare class MercadoLibreReviewProvider implements IReviewProvider {
    private extractItemId;
    getReviews(url: string): Promise<string[]>;
}
