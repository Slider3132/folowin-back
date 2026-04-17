import { User } from '@/modules/users/entities/user.entity';
import { Order } from '@/modules/orders/entities/order.entity';

export class ResponseCustomerDto {
  id: string;
  phone: string;
  email: string | null;
  user: User | null;
  managerContext: {
    id: string;
    name: string | null;
    category: string | null;
    comment: string | null;
    notes: string | null;
    extra: Record<string, any>;
    addresses: AddressDto[];
    orders: Order[];
  };
}

export class AddressDto {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string | null;
  countryCode: string | null;
  isDefault: boolean;
  placeId: string | null;
  lat: number | null;
  lng: number | null;
}
