import {ContributionStatus} from "../enums/contribution-status.enum";

export class Contribution {
    id: number;
    title: string;
    description: string;
    value: number;
    deadline: Date;
    valuePerHouse: number;
    status: ContributionStatus;
}