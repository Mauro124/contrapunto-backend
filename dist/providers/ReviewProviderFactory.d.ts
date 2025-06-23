import { IReviewProvider } from '../interfaces/IReviewProvider';
export declare class ReviewProviderFactory {
    static getProvider(url: string): IReviewProvider;
}
