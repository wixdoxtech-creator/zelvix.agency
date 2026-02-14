const quickLinks = ["Home", "About", "Product", "Review", "Contact"];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-[#A9B9F2]/40 bg-[#1F2F46] text-[#EAF2FF]">
      <div className="mx-auto w-[95%] max-w-7xl py-12 md:w-[90%]">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <img src="/logo.webp" alt="Zelvix logo" className="h-12 w-auto object-contain" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#BDD7E7]">
              Natural Ayurvedic wellness products crafted for daily balance, immunity, and better
              living.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-[#FFFFFF]">Quick Links</h3>
            <div className="mt-4 flex flex-col gap-2">
              {quickLinks.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="w-fit text-sm text-[#BDD7E7] transition-colors hover:text-[#FFFFFF]"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-[#FFFFFF]">Contact</h3>
            <div className="mt-4 space-y-2 text-sm text-[#BDD7E7]">
              <p>Email: support@zelvix.com</p>
              <p>Phone: +91 90000 00000</p>
              <p>Hours: Mon - Sat, 9:00 AM - 7:00 PM</p>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="#"
                className="rounded-full border border-[#5C8DB8]/60 px-3 py-1.5 text-xs font-semibold text-[#BDD7E7] transition hover:bg-[#2F4A68]"
              >
                Instagram
              </a>
              <a
                href="#"
                className="rounded-full border border-[#5C8DB8]/60 px-3 py-1.5 text-xs font-semibold text-[#BDD7E7] transition hover:bg-[#2F4A68]"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[#5C8DB8]/40 pt-5 text-center text-xs text-[#BDD7E7]">
          © {year} Zelvix. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
