"use client";
import { useEffect, useState } from "react";
import { Search, Package, Wrench, ChevronRight, ArrowLeft } from "lucide-react";

export default function WorkerServices() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profit")
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Filter logic
  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans text-gray-900">
      
      {/* --- Sticky Header & Search --- */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
          
          {/* App Bar */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Service Catalog</h1>
            <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
              {services.length} items
            </span>
          </div>

          {/* Search Field */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search services, tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        
        {/* Loading State */}
        {loading && (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 space-y-3 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3"></div>
              <div className="h-3 bg-gray-50 rounded w-1/2"></div>
              <div className="h-20 bg-gray-50 rounded-xl mt-4"></div>
            </div>
          ))
        )}

        {/* No Results State */}
        {!loading && filteredServices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
            <div className="bg-gray-100 p-4 rounded-full mb-3">
              <Search size={24} />
            </div>
            <p className="text-sm font-medium">No services found for "{search}"</p>
          </div>
        )}

        {/* Service Cards */}
        {filteredServices.map((s) => (
          <div
            key={s._id}
            className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-300"
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-1">
                  {s.category}
                </span>
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  {s.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="block text-lg font-black text-gray-900 tracking-tight">
                  ₹{s.price}
                </span>
              </div>
            </div>

            {/* Inventory Section */}
            {(s.products?.length > 0 || s.accessories?.length > 0) && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-3">
                
                {/* Products */}
                {s.products?.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Package size={12} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Consumables</p>
                    </div>
                    <ul className="grid grid-cols-1 gap-1">
                      {s.products.map((p, i) => (
                        <li key={i} className="flex justify-between items-center text-xs text-gray-600 font-medium pl-5 relative">
                          <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                          <span>{p.name}</span>
                          <span className="text-gray-400">{p.quantity} {p.unit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Divider if both exist */}
                {s.products?.length > 0 && s.accessories?.length > 0 && (
                  <div className="border-t border-gray-200/50"></div>
                )}

                {/* Accessories */}
                {s.accessories?.length > 0 && (
                  <div className="space-y-2">
                     <div className="flex items-center gap-2 text-gray-400">
                      <Wrench size={12} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Tools Required</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {s.accessories.map((a, i) => (
                        <span 
                          key={i} 
                          className={`text-[10px] font-bold px-2 py-1 rounded border ${
                            a.reusable 
                              ? "bg-white border-gray-200 text-gray-600" 
                              : "bg-amber-50 border-amber-100 text-amber-700"
                          }`}
                        >
                          {a.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}