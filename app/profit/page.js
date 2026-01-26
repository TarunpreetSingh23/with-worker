"use client";
import { useEffect, useState } from "react";
import { Search, Package, Wrench } from "lucide-react";

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

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans text-gray-900">
      
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">Service Catalog</h1>
            <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
              {services.length} items
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search services, tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        
        {/* Loading */}
        {loading && [...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border animate-pulse space-y-3">
            <div className="h-4 bg-gray-100 rounded w-1/3"></div>
            <div className="h-3 bg-gray-50 rounded w-1/2"></div>
            <div className="h-20 bg-gray-50 rounded-xl"></div>
          </div>
        ))}

        {/* No Results */}
        {!loading && filteredServices.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center text-gray-400">
            <div className="bg-gray-100 p-4 rounded-full mb-3">
              <Search size={24} />
            </div>
            <p className="text-sm font-medium">
              {`No services found for "${search}"`}
            </p>
          </div>
        )}

        {/* Services */}
        {filteredServices.map((s) => (
          <div key={s._id} className="bg-white rounded-2xl p-5 border shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded">
                  {s.category}
                </span>
                <h3 className="text-base font-bold">{s.name}</h3>
              </div>
              <span className="text-lg font-black">₹{s.price}</span>
            </div>

            {(s.products?.length > 0 || s.accessories?.length > 0) && (
              <div className="bg-gray-50 p-3 rounded-xl space-y-3">

                {/* Products */}
                {s.products?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase">
                      <Package size={12} /> Consumables
                    </div>
                    <ul className="text-xs mt-2 space-y-1">
                      {s.products.map((p, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{p.name}</span>
                          <span className="text-gray-400">{p.quantity} {p.unit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Accessories */}
                {s.accessories?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase">
                      <Wrench size={12} /> Tools
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {s.accessories.map((a, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-1 bg-white border rounded">
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
