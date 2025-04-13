import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { productPayment } from '@/utils/APIs';
import { RdirectUrlData } from '@/lang/RdirectUrl';

export default function MeetingsTable({ meetings = [], type, setUserLogin }) {
  // console.log("meetings==>", meetings[1].hasPayment)

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const router = useRouter();
  const { isAuthenticated, user, paymentStatus } = useSelector((state) => state.auth);
  const uuId = user?.data?.result?.user?.guestUser?.uuid;

  // Memoize pagination calculations
  const { currentMeetings, totalPages, indexOfFirstItem, indexOfLastItem } = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMeetings = meetings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(meetings.length / itemsPerPage);

    return {
      currentMeetings,
      totalPages,
      indexOfFirstItem,
      indexOfLastItem
    };
  }, [meetings, currentPage, itemsPerPage]);

  // Format date - memoize if this is called frequently
  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle joining a meeting
  const handleJoinMeeting = useCallback((meeting) => {
    localStorage.setItem("currentRoomId", meeting.roomId);

    if (isAuthenticated) {
      if (type === "mybooking") {
        makePayment(meeting);
      } else if (paymentStatus === "paid") {
        // router.push(`/room/${meeting.roomId}?role=${type}`);
        const url = `${window.location.origin}${RdirectUrlData.ROME}/${meeting.roomId}?role=${type}`;
        window.open(url, '_blank');
      } else {
        // router.push(`/room/${meeting.roomId}?role=${type}`);
        const url = `${window.location.origin}${RdirectUrlData.ROME}/${meeting.roomId}?role=${type}`;
        window.open(url, '_blank');
      }
    } else {
      setUserLogin?.(true);
    }
  }, [isAuthenticated, type, paymentStatus, router, setUserLogin]);

  // Payment processing
  const makePayment = useCallback(async (meeting) => {
    try {
      if (!uuId) {
        console.error("User ID not found");
        return;
      }

      const cardData = {
        uuid: uuId,
        id: 2,
        title: meeting.title,
        price: meeting.price || 12,
        active: false,
        meeting_id: meeting.id,
      };

      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

      // Call payment API
      const session = await productPayment(cardData);

      // Redirect to checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error("Stripe Checkout Error:", result.error.message);
      }
    } catch (error) {
      console.error("Payment processing error:", error.message);
    }
  }, [uuId]);

  // Page navigation
  const goToPrevPage = useCallback(() =>
    setCurrentPage(prev => Math.max(prev - 1, 1)), []);

  const goToNextPage = useCallback(() =>
    setCurrentPage(prev => Math.min(prev + 1, totalPages)), [totalPages]);

  // Username extraction helper
  const getUsernameFromEmail = useCallback((email) => {
    if (!email) return "Guest User";
    const username = email.split("@")[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  }, []);

  // Empty state
  if (!meetings.length) {
    return (
      <div className="w-full bg-white shadow-md rounded-lg overflow-hidden h-full flex items-center justify-center">
        <div className="text-center py-8">
          <p className="text-gray-500 text-[40px]">No meetings scheduled yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white shadow-md rounded-lg overflow-hidden relative" style={{ height: "100%" }}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-800">
            <tr>
              {['ID', 'Title', 'Description', 'Scheduled For', 'Host', 'Price', 'Action'].map(header => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium bg-gray-900 text-white uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentMeetings.map((meeting, index) => (
              <tr key={meeting.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {meeting.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {meeting.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(meeting.scheduledFor)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getUsernameFromEmail(meeting.GuestUser?.email)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${meeting.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleJoinMeeting(meeting)}
                    disabled={type == "host" ? !meeting?.hasPayment : ""}
                    className="w-[100px] cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {type === "mybooking" ? "Pay Now" : (type === "audience" ? "Join now" : (meeting?.hasPayment === true ? "Join Meeting" : "Pending"))}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - only render if more than one page */}
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t bg-gray-900 text-white border-gray-200 absolute w-full bottom-0">
          {/* Mobile pagination */}
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md bg-gray-900 text-white ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-800'}`}
            >
              Previous
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md bg-gray-900 text-white ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-800'}`}
            >
              Next
            </button>
          </div>

          {/* Desktop pagination */}
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-white">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastItem, meetings.length)}</span>{' '}
                of <span className="font-medium">{meetings.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center border px-2 py-2 rounded-l-md bg-orange-500 hover:bg-orange-600 text-sm font-medium"
                  aria-label="Previous page"
                >
                  &larr;
                </button>

                {/* Show only a limited number of pages for better performance */}
                {Array.from(
                  { length: Math.min(5, totalPages) },
                  (_, i) => {
                    // Logic to show current page and nearby pages
                    const pageNum = currentPage <= 3 ?
                      i + 1 :
                      currentPage + i - 2 > totalPages ?
                        totalPages - 4 + i :
                        currentPage + i - 2;

                    return pageNum > 0 && pageNum <= totalPages ? (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum ?
                            'z-10 bg-orange-500 hover:bg-orange-600 text-white' :
                            'bg-orange-500 hover:bg-orange-600 text-white'
                          }`}
                      >
                        {pageNum}
                      </button>
                    ) : null;
                  }
                )}

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 border rounded-r-md bg-orange-500 hover:bg-orange-600 text-sm font-medium"
                  aria-label="Next page"
                >
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}