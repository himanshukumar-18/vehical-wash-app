"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    ReactNode,
} from "react";

export type PaymentMethod = "razorpay" | "cash";

export interface Vehicle {
    id: string | number;
    name?: string;
    brand: string;
    model?: string;
    registration_number: string;
    vehicle_type?: string;
}

export interface Service {
    id: string | number;
    name: string;
    price: number | string;
    duration?: number;
    duration_minutes?: number;
    description?: string;
}

export interface AddressDetails {
    address: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
}

interface BookingState {
    isOpen: boolean;
    currentStep: number;

    vehicle: Vehicle | null;
    service: Service | null;

    date: string | null;

    addressDetails: AddressDetails;
    address: string;

    coupon: string;
    notes: string;

    paymentMethod: PaymentMethod;

    loading: boolean;
}

interface OpenBookingOptions {
    service?: Service;
    vehicle?: Vehicle;
}

interface BookingContextType extends BookingState {
    openBooking: (options?: OpenBookingOptions) => void;
    closeBooking: () => void;

    nextStep: () => void;
    previousStep: () => void;
    goToStep: (step: number) => void;

    setVehicle: (vehicle: Vehicle) => void;
    setService: (service: Service) => void;
    setDate: (date: string) => void;

    setAddressDetails: (details: Partial<AddressDetails>) => void;
    setAddress: (address: string) => void;

    setCoupon: (coupon: string) => void;
    setNotes: (notes: string) => void;

    setPaymentMethod: (method: PaymentMethod) => void;

    setLoading: (loading: boolean) => void;

    resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | null>(null);

const initialAddressDetails: AddressDetails = {
    address: "",
    area: "",
    city: "Hazaribagh",
    state: "Jharkhand",
    pincode: "825301",
    phone: "",
};

const initialState: BookingState = {
    isOpen: false,
    currentStep: 0,

    vehicle: null,
    service: null,

    date: null,

    addressDetails: initialAddressDetails,
    address: "",

    coupon: "",
    notes: "",

    paymentMethod: "razorpay",

    loading: false,
};

interface Props {
    children: ReactNode;
}

export function BookingProvider({ children }: Props) {
    const [state, setState] = useState(initialState);

    const openBooking = useCallback(
        (options?: OpenBookingOptions) => {
            setState((prev) => ({
                ...prev,
                isOpen: true,
                service: options?.service ?? prev.service,
                vehicle: options?.vehicle ?? prev.vehicle,
            }));
        },
        []
    );

    const closeBooking = useCallback(() => {
        setState((prev) => ({
            ...prev,
            isOpen: false,
        }));
    }, []);

    const nextStep = useCallback(() => {
        setState((prev) => ({
            ...prev,
            currentStep: Math.min(prev.currentStep + 1, 5),
        }));
    }, []);

    const previousStep = useCallback(() => {
        setState((prev) => ({
            ...prev,
            currentStep: Math.max(prev.currentStep - 1, 0),
        }));
    }, []);

    const goToStep = useCallback((step: number) => {
        setState((prev) => ({
            ...prev,
            currentStep: step,
        }));
    }, []);

    const setVehicle = useCallback((vehicle: Vehicle) => {
        setState((prev) => ({
            ...prev,
            vehicle,
        }));
    }, []);

    const setService = useCallback((service: Service) => {
        setState((prev) => ({
            ...prev,
            service,
        }));
    }, []);

    const setDate = useCallback((date: string) => {
        setState((prev) => ({
            ...prev,
            date,
        }));
    }, []);

    const setAddressDetails = useCallback((details: Partial<AddressDetails>) => {
        setState((prev) => {
            const updated = { ...prev.addressDetails, ...details };
            const fullAddressParts = [
                updated.address,
                updated.area,
                updated.city,
                updated.state ? `${updated.state} - ${updated.pincode}` : updated.pincode,
                updated.phone ? `Ph: ${updated.phone}` : "",
            ].filter(Boolean);
            return {
                ...prev,
                addressDetails: updated,
                address: fullAddressParts.join(", "),
            };
        });
    }, []);

    const setAddress = useCallback((address: string) => {
        setState((prev) => ({
            ...prev,
            address,
        }));
    }, []);

    const setCoupon = useCallback((coupon: string) => {
        setState((prev) => ({
            ...prev,
            coupon,
        }));
    }, []);

    const setNotes = useCallback((notes: string) => {
        setState((prev) => ({
            ...prev,
            notes,
        }));
    }, []);

    const setPaymentMethod = useCallback((paymentMethod: PaymentMethod) => {
        setState((prev) => ({
            ...prev,
            paymentMethod,
        }));
    }, []);

    const setLoading = useCallback((loading: boolean) => {
        setState((prev) => ({
            ...prev,
            loading,
        }));
    }, []);

    const resetBooking = useCallback(() => {
        setState(initialState);
    }, []);

    const value = useMemo(
        () => ({
            ...state,

            openBooking,
            closeBooking,

            nextStep,
            previousStep,
            goToStep,

            setVehicle,
            setService,
            setDate,

            setAddressDetails,
            setAddress,

            setCoupon,
            setNotes,

            setPaymentMethod,

            setLoading,

            resetBooking,
        }),
        [
            state,
            openBooking,
            closeBooking,
            nextStep,
            previousStep,
            goToStep,
            setVehicle,
            setService,
            setDate,
            setAddressDetails,
            setAddress,
            setCoupon,
            setNotes,
            setPaymentMethod,
            setLoading,
            resetBooking,
        ]
    );

    return (
        <BookingContext.Provider value={value}>
            {children}
        </BookingContext.Provider>
    );
}

export function useBooking() {
    const context = useContext(BookingContext);

    if (!context) {
        throw new Error("useBooking must be used inside BookingProvider");
    }

    return context;
}