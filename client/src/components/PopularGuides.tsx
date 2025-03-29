import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { Guide } from "@shared/schema";
import { getRecentGuides } from "@/services/apiService";

interface PopularGuidesProps {
  className?: string;
}

const PopularGuides: React.FC<PopularGuidesProps> = ({ className = "" }) => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const data = await getRecentGuides(4);
        setGuides(data);
      } catch (error) {
        console.error("Error fetching popular guides:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuides();
  }, []);

  if (isLoading) {
    return (
      <div className={`mt-12 ${className}`}>
        <h2 className="text-2xl font-bold mb-6 text-center">Popular Guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-secondary/20 border border-gray-800 rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (guides.length === 0) {
    return null;
  }

  return (
    <div className={`mt-12 ${className}`}>
      <h2 className="text-2xl font-bold mb-6 text-center">Popular Guides</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {guides.map((guide) => (
          <Link key={guide.id} href={`/guide/${guide.slug}`}>
            <div className="bg-secondary/20 border border-gray-800 rounded-lg p-4 hover:bg-secondary/30 transition-colors cursor-pointer h-full">
              <h3 className="font-medium mb-2 line-clamp-2">{guide.title}</h3>
              <p className="text-sm text-gray-400">
                {new Date(guide.createdAt).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularGuides;