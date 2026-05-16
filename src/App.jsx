import { Routes, Route } from 'react-router-dom'
import StoresPage from './pages/StoresPage.jsx'
import StoreDetailPage from './pages/StoreDetailPage.jsx'
import StoreFormPage from './pages/StoreFormPage.jsx'
import DishFormPage from './pages/DishFormPage.jsx'
import RatingPage from './pages/RatingPage.jsx'
import TagsPage from './pages/TagsPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StoresPage />} />
      <Route path="/stores/new" element={<StoreFormPage />} />
      <Route path="/stores/:id" element={<StoreDetailPage />} />
      <Route path="/stores/:id/edit" element={<StoreFormPage />} />
      <Route path="/stores/:id/dishes/new" element={<DishFormPage />} />
      <Route path="/stores/:id/rate" element={<RatingPage />} />
      <Route path="/tags" element={<TagsPage />} />
    </Routes>
  )
}
