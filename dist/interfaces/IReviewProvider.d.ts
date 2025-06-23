export interface IReviewProvider {
    getReviews(url: string): Promise<string[]>;
}
