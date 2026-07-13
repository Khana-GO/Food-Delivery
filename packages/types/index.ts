export enum UserRole{
    CUSTOMER = "CUSTOMER",
    RESTAURANT_OWNER = "RESTAURANT_OWNER",
    DELIVERY_PERSON = "DELIVERY_PERSON"

}

export interface User {
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    role : UserRole,
    createdAt: Date
}


export interface HealthCheckResponse{
    status: string,
    timestamp: Date, 
}