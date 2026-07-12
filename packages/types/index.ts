export enum UserRole{
    CUSTOMER = "CUSTOMER",
    RESTAURANT_OWNER = "RESTAURANT_OWNER",
    DRIVER = "DRIVER"

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