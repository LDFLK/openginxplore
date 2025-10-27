import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Error500() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/");
        }, 3000)

        return () => clearTimeout(timer);

    },[navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black ">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          {/* Large 500 Text */}
          <div className="relative">
            <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-white via-blue-400 to-purple-800 bg-clip-text text-transparent">
              500
            </h1>
            <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-blue-500/20 blur-sm">500</div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-white">Server Error</h2>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              There is some internal server error. Please try again later.
            </p>
          </div>

          {/* Redirecting Text */}
          <div className="pt-8">
            <p className="text-cyan-400 text-xl font-medium animate-pulse">
              Redirecting to the home page
            </p>
          </div>

          {/* Additional Visual Elements */}
          <div className="flex justify-center space-x-2 pt-2">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
