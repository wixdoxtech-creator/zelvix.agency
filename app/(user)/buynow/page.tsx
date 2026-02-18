"use client";

import { useEffect, useMemo, useState } from "react";
import { getCart } from "@/lib/helper";

type CartItem = {
  name: string;
  image: string;
  qty: number;
  prise: number;
};

type AddressItem = {
  id: number;
  full_name: string;
  mobile: string;
  address_line_1: string;
  address_line_2?: string | null;
  postal_code: string;
  is_default?: boolean;
};

type PaymentGatewayItem = {
  id: number;
  name: string;
  app_id?: string | null;
  secret_key?: string | null;
  is_active: boolean;
};

type PincodeItem = {
  id: number;
  city_id: number;
  pincode: string;
};

type CityItem = {
  id: number;
  state_id: number;
  name: string;
};

type StateItem = {
  id: number;
  country_id: number;
  name: string;
};

type CountryItem = {
  id: number;
  name: string;
};

const BuyNowPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [message, setMessage] = useState("");

  const [userId, setUserId] = useState("1");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [countryId, setCountryId] = useState<number | null>(null);
  const [stateId, setStateId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [pincodeId, setPincodeId] = useState<number | null>(null);
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [savedSelectedAddressId, setSavedSelectedAddressId] = useState<
    number | null
  >(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayItem[]>(
    [],
  );
  const [loadingGateways, setLoadingGateways] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<number | null>(null);

  useEffect(() => {
    setCartItems(getCart<CartItem>());

    const fromLocalStorage =
      localStorage.getItem("user_id") ||
      localStorage.getItem("id") ||
      localStorage.getItem("userId") ||
      localStorage.getItem("user-id");
    if (fromLocalStorage && Number(fromLocalStorage) > 0) {
      setUserId(fromLocalStorage);
    }

    const selectedAddressFromStorage = localStorage.getItem(
      "selected_address_id",
    );
    if (selectedAddressFromStorage && Number(selectedAddressFromStorage) > 0) {
      setSavedSelectedAddressId(Number(selectedAddressFromStorage));
    }
  }, []);

  useEffect(() => {
    const loadPaymentGateways = async () => {
      setLoadingGateways(true);
      try {
        const response = await fetch("/api/payment?active_only=true");
        const data = (await response.json()) as {
          data?: PaymentGatewayItem[];
          message?: string;
        };

        if (!response.ok) {
          setPaymentGateways([]);
          setSelectedGateway(null);
          setMessage(data.message ?? "Failed to load payment gateways");
          return;
        }

        const gateways = Array.isArray(data.data)
          ? data.data.filter((item) => item.is_active)
          : [];

        setPaymentGateways(gateways);
        setSelectedGateway(gateways.length > 0 ? gateways[0].id : null);
      } catch {
        setPaymentGateways([]);
        setSelectedGateway(null);
        setMessage("Failed to load payment gateways");
      } finally {
        setLoadingGateways(false);
      }
    };

    void loadPaymentGateways();
  }, []);

  useEffect(() => {
    const loadAddresses = async () => {
      const parsedUserId = Number(userId);
      if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
        setAddresses([]);
        return;
      }

      setLoadingAddresses(true);
      try {
        const response = await fetch(`/api/address?user_id=${parsedUserId}`);
        const data = (await response.json()) as {
          data?: AddressItem[];
          message?: string;
        };

        if (!response.ok) {
          setMessage(data.message ?? "Failed to load addresses");
          setAddresses([]);
          return;
        }

        const nextAddresses = Array.isArray(data.data) ? data.data : [];
        setAddresses(nextAddresses);

        if (nextAddresses.length > 0) {
          const fromStorage = nextAddresses.find(
            (item) => item.id === savedSelectedAddressId,
          );
          const defaultAddress = nextAddresses.find((item) => item.is_default);
          setSelectedAddressId(
            fromStorage?.id ?? defaultAddress?.id ?? nextAddresses[0].id,
          );
        } else {
          setSelectedAddressId(null);
        }
      } catch {
        setMessage("Failed to load addresses");
        setAddresses([]);
        setSelectedAddressId(null);
      } finally {
        setLoadingAddresses(false);
      }
    };

    void loadAddresses();
  }, [savedSelectedAddressId, userId]);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch(
          "/api/locations/country?status=active&page=1&limit=200",
        );
        const data = (await response.json()) as { data?: CountryItem[] };
        setCountries(Array.isArray(data.data) ? data.data : []);
      } catch {
        setCountries([]);
      }
    };

    void loadCountries();
  }, []);

  useEffect(() => {
    if (!countryId) {
      setStates([]);
      setStateId(null);
      setCities([]);
      setCityId(null);
      return;
    }

    const loadStates = async () => {
      try {
        const response = await fetch(
          `/api/locations/state?country_id=${countryId}&status=active&page=1&limit=200`,
        );
        const data = (await response.json()) as { data?: StateItem[] };
        const nextStates = Array.isArray(data.data) ? data.data : [];
        setStates(nextStates);

        if (!nextStates.some((item) => item.id === stateId)) {
          setStateId(null);
          setCities([]);
          setCityId(null);
        }
      } catch {
        setStates([]);
      }
    };

    void loadStates();
  }, [countryId, stateId]);

  useEffect(() => {
    if (!stateId) {
      setCities([]);
      setCityId(null);
      return;
    }

    const loadCities = async () => {
      try {
        const response = await fetch(
          `/api/locations/city?state_id=${stateId}&status=active&page=1&limit=200`,
        );
        const data = (await response.json()) as { data?: CityItem[] };
        const nextCities = Array.isArray(data.data) ? data.data : [];
        setCities(nextCities);

        if (!nextCities.some((item) => item.id === cityId)) {
          setCityId(null);
        }
      } catch {
        setCities([]);
      }
    };

    void loadCities();
  }, [cityId, stateId]);

  useEffect(() => {
    if (selectedAddressId === null) {
      localStorage.removeItem("selected_address_id");
      return;
    }

    localStorage.setItem("selected_address_id", String(selectedAddressId));
  }, [selectedAddressId]);

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.prise || 0), 0),
    [cartItems],
  );
  const selectedAddress = useMemo(
    () => addresses.find((item) => item.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  useEffect(() => {
    const trimmedPincode = postalCode.trim();

    if (!/^\d{6}$/.test(trimmedPincode)) {
      setCountryId(null);
      setStateId(null);
      setCityId(null);
      setPincodeId(null);
      setLocationMessage("");
      setLoadingLocation(false);
      return;
    }

    let isCancelled = false;

    const loadLocationByPincode = async () => {
      setLoadingLocation(true);
      setLocationMessage("");

      try {
        const pincodeResponse = await fetch(
          `/api/locations/pincode?search=${trimmedPincode}&status=active&page=1&limit=20`,
        );
        const pincodeData = (await pincodeResponse.json()) as {
          data?: PincodeItem[];
        };

        if (!pincodeResponse.ok || !Array.isArray(pincodeData.data)) {
          if (!isCancelled) {
            setLocationMessage("Pincode not found.");
          }
          return;
        }

        const matchedPincode =
          pincodeData.data.find(
            (item) => String(item.pincode ?? "").trim() === trimmedPincode,
          ) ?? null;

        if (!matchedPincode) {
          if (!isCancelled) {
            setLocationMessage("Pincode not found.");
          }
          return;
        }

        const cityResponse = await fetch(
          `/api/locations/city?id=${matchedPincode.city_id}`,
        );
        const cityData = (await cityResponse.json()) as { data?: CityItem };
        if (!cityResponse.ok || !cityData.data) {
          if (!isCancelled) {
            setLocationMessage("City not found for this pincode.");
          }
          return;
        }

        const stateResponse = await fetch(
          `/api/locations/state?id=${cityData.data.state_id}`,
        );
        const stateData = (await stateResponse.json()) as { data?: StateItem };
        if (!stateResponse.ok || !stateData.data) {
          if (!isCancelled) {
            setLocationMessage("State not found for this pincode.");
          }
          return;
        }

        const countryResponse = await fetch(
          `/api/locations/country?id=${stateData.data.country_id}`,
        );
        const countryData = (await countryResponse.json()) as {
          data?: CountryItem;
        };
        if (!countryResponse.ok || !countryData.data) {
          if (!isCancelled) {
            setLocationMessage("Country not found for this pincode.");
          }
          return;
        }

        if (!isCancelled) {
          setPincodeId(matchedPincode.id);
          setCityId(cityData.data.id);
          setStateId(stateData.data.id);
          setCountryId(countryData.data.id);
          setLocationMessage("Location auto-filled from pincode.");
        }
      } catch {
        if (!isCancelled) {
          setLocationMessage("Failed to fetch location by pincode.");
        }
      } finally {
        if (!isCancelled) {
          setLoadingLocation(false);
        }
      }
    };

    void loadLocationByPincode();

    return () => {
      isCancelled = true;
    };
  }, [postalCode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      if (!countryId || !stateId || !cityId) {
        setMessage("Select country, state and city.");
        return;
      }

      const payload = {
        user_id: Number(userId),
        full_name: fullName.trim(),
        mobile: mobile.trim(),
        address_line_1: addressLine1.trim(),
        address_line_2: addressLine2.trim(),
        country_id: countryId,
        state_id: stateId,
        city_id: cityId,
        pincode_id: pincodeId,
        postal_code: postalCode.trim(),
        is_default: isDefault,
        address_type: "home",
        status: "active",
      };

      const response = await fetch("/api/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(data.message ?? "Failed to save address");
        return;
      }

      setMessage(data.message ?? "Address saved successfully");
      setFullName("");
      setMobile("");
      setAddressLine1("");
      setAddressLine2("");
      setPostalCode("");
      setCountryId(null);
      setStateId(null);
      setCityId(null);
      setPincodeId(null);
      setStates([]);
      setCities([]);
      setLocationMessage("");
      setIsDefault(false);
      setIsAddressModalOpen(false);

      const refreshed = await fetch(`/api/address?user_id=${Number(userId)}`);
      const refreshedData = (await refreshed.json()) as {
        data?: AddressItem[];
      };
      const nextAddresses = Array.isArray(refreshedData.data)
        ? refreshedData.data
        : [];
      setAddresses(nextAddresses);
      if (nextAddresses.length > 0) {
        const defaultAddress = nextAddresses.find((item) => item.is_default);
        setSelectedAddressId(defaultAddress?.id ?? nextAddresses[0].id);
      }
    } catch {
      setMessage("Failed to save address");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceed = () => {
    if (cartItems.length === 0) {
      setMessage("Add product to cart before proceeding.");
      return;
    }
    if (!selectedAddress) {
      setMessage("Please select an address before proceeding.");
      return;
    }
    if (paymentGateways.length === 0) {
      setMessage("No active payment gateway available.");
      return;
    }
    setMessage("");
    setIsPaymentModalOpen(true);
  };

  return (
    <main className="min-h-screen w-full bg-[#f7fafc] py-8">
      <section className="mx-auto grid w-[95%] max-w-7xl grid-cols-1 gap-6 md:w-[90%] lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-[#d7e5f2] bg-white p-5 shadow-[0_10px_24px_rgba(31,47,70,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#1F2F46]">Address</h1>
              <p className="mt-1 text-sm text-[#2F4A68]">
                Select one address for this order.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(true)}
              className="rounded-full border border-[#2F4A68] bg-linear-to-b from-[#5C8DB8] to-[#1F2F46] px-4 py-2 text-sm font-semibold text-[#FFF1EB] shadow-[0_10px_20px_rgba(31,47,70,0.25)] transition hover:opacity-90"
            >
              Add Address
            </button>
          </div>

          {message && <p className="mt-3 text-sm text-[#2F4A68]">{message}</p>}

          <div className="mt-6">
            <h2 className="text-base font-semibold text-[#1F2F46]">
              Saved Addresses
            </h2>
            {loadingAddresses ? (
              <p className="mt-2 text-sm text-[#2F4A68]">Loading...</p>
            ) : addresses.length === 0 ? (
              <p className="mt-2 text-sm text-[#2F4A68]">No addresses found.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {addresses.map((address) => (
                  <article
                    key={address.id}
                    onClick={() => setSelectedAddressId(address.id)}
                    className={`cursor-pointer rounded-md border p-3 transition ${
                      selectedAddressId === address.id
                        ? "border-[#1F2F46] bg-[#EAF2FF]"
                        : "border-[#D9E8F4] bg-[#f8fbff] hover:border-[#7b98b7]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[#1F2F46]">
                        {address.full_name}{" "}
                        {address.is_default ? "(Default)" : ""}
                      </p>
                      {selectedAddressId === address.id && (
                        <span className="rounded-full bg-[#1F2F46] px-2 py-0.5 text-[10px] font-semibold text-white">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#2F4A68]">{address.mobile}</p>
                    <p className="text-sm text-[#2F4A68]">
                      {address.address_line_1}
                      {address.address_line_2
                        ? `, ${address.address_line_2}`
                        : ""}
                    </p>
                    <p className="text-sm text-[#2F4A68]">
                      {address.postal_code}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-2xl border border-[#d7e5f2] bg-white p-5 shadow-[0_10px_24px_rgba(31,47,70,0.08)]">
          <h2 className="text-xl font-bold text-[#1F2F46]">Product Summary</h2>
          <p className="mt-1 text-sm text-[#2F4A68]">Items from your cart</p>

          <div className="mt-4 space-y-3">
            {cartItems.length === 0 ? (
              <p className="text-sm text-[#2F4A68]">Your cart is empty.</p>
            ) : (
              cartItems.map((item, index) => (
                <article
                  key={`${item.name}-${index}`}
                  className="flex items-start gap-3 rounded-lg border border-[#D9E8F4] bg-[#f8fbff] p-3"
                >
                  <img
                    src={item.image || "/homeImage2.webp"}
                    alt={item.name}
                    className="h-14 w-14 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#1F2F46]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-[#2F4A68]">
                      Qty: {item.qty}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#1F2F46]">
                      ₹{Number(item.prise || 0).toFixed(2)}
                    </p>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="mt-5 border-t border-[#d7e5f2] pt-4">
            <p className="text-sm text-[#2F4A68]">
              Total:{" "}
              <span className="text-base font-bold text-[#1F2F46]">
                ₹{total.toFixed(2)}
              </span>
            </p>
            <button
              type="button"
              onClick={handleProceed}
              className="mt-4 w-full rounded-full border border-[#2F4A68] bg-linear-to-b from-[#5C8DB8] to-[#1F2F46] px-5 py-2.5 text-sm font-semibold text-[#FFF1EB] shadow-[0_10px_20px_rgba(31,47,70,0.25)] transition hover:opacity-90"
            >
              Proceed
            </button>
          </div>
        </aside>
      </section>

      {isAddressModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2F46]/45 p-4"
          onClick={() => setIsAddressModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-[#d7e5f2] bg-white p-5 shadow-[0_16px_36px_rgba(31,47,70,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1F2F46]">Add Address</h2>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="rounded-md border border-[#d7e5f2] px-3 py-1.5 text-sm font-semibold text-[#2F4A68]"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-4 grid gap-3 md:grid-cols-2"
            >
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-[#2F4A68]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Full Name"
                  className="rounded-md border border-[#CFE4F2] px-3 py-2 text-sm outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  required
                />
              </div>
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-[#2F4A68]">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value)}
                  placeholder="Mobile Number"
                  className="rounded-md border border-[#CFE4F2] px-3 py-2 text-sm outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  required
                />
              </div>
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-[#2F4A68]">
                  Pincode
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(event) => setPostalCode(event.target.value)}
                  placeholder="Postal Code"
                  className="rounded-md border border-[#CFE4F2] px-3 py-2 text-sm outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  required
                />
              </div>
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-[#2F4A68]">
                  Country
                </label>
                <select
                  value={countryId ?? ""}
                  onChange={(event) =>
                    setCountryId(
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                  className="rounded-md border border-[#CFE4F2] bg-white px-3 py-2 text-sm text-[#2F4A68] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  required
                >
                  <option value="">Select country</option>
                  {countries.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-[#2F4A68]">
                  State
                </label>
                <select
                  value={stateId ?? ""}
                  onChange={(event) =>
                    setStateId(
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                  className="rounded-md border border-[#CFE4F2] bg-white px-3 py-2 text-sm text-[#2F4A68] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  required
                >
                  <option value="">Select state</option>
                  {states.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1 md:col-span-2">
                <label className="text-xs font-semibold text-[#2F4A68]">
                  City
                </label>
                <select
                  value={cityId ?? ""}
                  onChange={(event) =>
                    setCityId(
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                  className="rounded-md border border-[#CFE4F2] bg-white px-3 py-2 text-sm text-[#2F4A68] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  required
                >
                  <option value="">Select city</option>
                  {cities.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="md:col-span-2 text-xs text-[#2F4A68]">
                {loadingLocation
                  ? "Finding location from pincode..."
                  : locationMessage}
              </p>
              <div className="grid gap-1 md:col-span-2">
                <label className="text-xs font-semibold text-[#2F4A68]">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(event) => setAddressLine1(event.target.value)}
                  placeholder="Address Line 1"
                  className="rounded-md border border-[#CFE4F2] px-3 py-2 text-sm outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  required
                />
              </div>
              <div className="grid gap-1 md:col-span-2">
                <label className="text-xs font-semibold text-[#2F4A68]">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(event) => setAddressLine2(event.target.value)}
                  placeholder="Address Line 2 (Optional)"
                  className="rounded-md border border-[#CFE4F2] px-3 py-2 text-sm outline-none ring-[#4F6D7A]/30 focus:ring-2"
                />
              </div>
              <label className="md:col-span-2 inline-flex items-center gap-2 text-sm text-[#2F4A68]">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(event) => setIsDefault(event.target.checked)}
                />
                Set as default address
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="md:col-span-2 rounded-full border border-[#2F4A68] bg-linear-to-b from-[#5C8DB8] to-[#1F2F46] px-6 py-3 text-sm font-semibold text-[#FFF1EB] shadow-[0_10px_20px_rgba(31,47,70,0.25)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Saving..." : "Save Address"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2F46]/45 p-4"
          onClick={() => setIsPaymentModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-[#d7e5f2] bg-white p-5 shadow-[0_16px_36px_rgba(31,47,70,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1F2F46]">
                Select Payment Gateway
              </h2>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="rounded-md border border-[#d7e5f2] px-3 py-1.5 text-sm font-semibold text-[#2F4A68]"
              >
                Close
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-[#d7e5f2]">
              <table className="w-full text-sm">
                <thead className="bg-[#f2f7fc]">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-[#1F2F46]">
                      Select
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-[#1F2F46]">
                      Gateway
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-[#1F2F46]">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingGateways ? (
                    <tr className="border-t border-[#e6eef7]">
                      <td className="px-3 py-3 text-sm text-[#2F4A68]" colSpan={3}>
                        Loading gateways...
                      </td>
                    </tr>
                  ) : paymentGateways.length === 0 ? (
                    <tr className="border-t border-[#e6eef7]">
                      <td className="px-3 py-3 text-sm text-[#2F4A68]" colSpan={3}>
                        No active payment gateway found.
                      </td>
                    </tr>
                  ) : (
                    paymentGateways.map((gateway) => (
                      <tr key={gateway.id} className="border-t border-[#e6eef7]">
                        <td className="px-3 py-2">
                          <input
                            type="radio"
                            name="payment_gateway"
                            checked={selectedGateway === gateway.id}
                            onChange={() => setSelectedGateway(gateway.id)}
                          />
                        </td>
                        <td className="px-3 py-2 font-medium text-[#1F2F46]">
                          {gateway.name}
                        </td>
                        <td className="px-3 py-2 text-[#2F4A68]">
                          Ready to use
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-[#2F4A68]">
                Selected Address:{" "}
                <span className="font-semibold text-[#1F2F46]">
                  {selectedAddress?.full_name}
                </span>
              </p>
              <button
                type="button"
                className="rounded-full border border-[#2F4A68] bg-linear-to-b from-[#5C8DB8] to-[#1F2F46] px-5 py-2 text-sm font-semibold text-[#FFF1EB] shadow-[0_10px_20px_rgba(31,47,70,0.25)] transition hover:opacity-90"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default BuyNowPage;
