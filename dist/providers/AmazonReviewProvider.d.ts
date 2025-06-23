import { IReviewProvider } from '../interfaces/IReviewProvider';
export declare class AmazonReviewProvider implements IReviewProvider {
    getReviews(url: string): Promise<string[]>;
}
