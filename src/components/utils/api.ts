
interface ApiResponse<T> {
  status: boolean;
  message: string;
  data?: T;
}

export async function fetchFAQs(): Promise<any[]> {
  try {
    const response = await fetch('/backend/api/faq/list.php');
    const result: ApiResponse<any[]> = await response.json();
    
    if (!result.status) {
      throw new Error(result.message);
    }
    
    return result.data || [];
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
}

export async function searchFlights(params: {
  departure?: string;
  arrival?: string;
  date?: string;
  passengers?: number;
}): Promise<any[]> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.departure) queryParams.append('departure', params.departure);
    if (params.arrival) queryParams.append('arrival', params.arrival);
    if (params.date) queryParams.append('date', params.date);
    if (params.passengers) queryParams.append('passengers', params.passengers.toString());
    
    const response = await fetch(`/backend/api/flights/search.php?${queryParams.toString()}`);
    const result: ApiResponse<any[]> = await response.json();
    
    if (!result.status) {
      throw new Error(result.message);
    }
    
    return result.data || [];
  } catch (error) {
    console.error('Error searching flights:', error);
    return [];
  }
}

export async function getBookings(): Promise<any[]> {
  try {
    const response = await fetch('/backend/api/bookings/list.php');
    const result: ApiResponse<any[]> = await response.json();
    
    if (!result.status) {
      throw new Error(result.message);
    }
    
    return result.data || [];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

export async function createBooking(bookingData: any): Promise<boolean> {
  try {
    const response = await fetch('/backend/api/bookings/create.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    const result: ApiResponse<any> = await response.json();
    
    if (!result.status) {
      throw new Error(result.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error creating booking:', error);
    return false;
  }
}

export async function submitContactForm(formData: any): Promise<boolean> {
  try {
    const response = await fetch('/backend/api/contact/submit.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    const result: ApiResponse<any> = await response.json();
    
    if (!result.status) {
      throw new Error(result.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return false;
  }
}
