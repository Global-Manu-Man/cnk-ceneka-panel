import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import Select, { MultiValue, StylesConfig, ControlProps, OptionProps, SingleValue } from 'react-select';

interface FeatureOption {
  value: string;
  label: string;
}

interface PropertyTypeOption {
  value: number;
  label: string;
}

interface SaleTypeOption {
  value: number;
  label: string;
}

interface LegalStatusOption {
  value: number;
  label: string;
}

interface ColonyOption {
  value: string;
  label: string;
}

interface PropertyFormData {
  title: string;
  price: string;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  features: string[];
  location: string;
  images: string[];
  // Additional fields for API
  client: string;
  property_code: string;
  property_type_id: number;
  sale_type_id: number;
  legal_status_id: number;
  commercial_value: number;
  street: string;
  exterior_number: string;
  postal_code: string;
  land_size: number;
  parking_spaces: number;
  state: string;
  municipality: string;
  colony: string;
}

// Valor estático para property_code
const STATIC_PROPERTY_CODE = 'PROP-2023-001';

const initialFormData: PropertyFormData = {
  title: '',
  price: '',
  beds: 0,
  baths: 0,
  sqft: 0,
  description: '',
  features: [],
  location: '',
  images: [],
  // Initialize additional fields
  client: 'Emmanuel',
  property_code: STATIC_PROPERTY_CODE, // Usar el valor estático
  property_type_id: 1,
  sale_type_id: 2,
  legal_status_id: 1,
  commercial_value: 0,
  street: '',
  exterior_number: '',
  postal_code: '',
  land_size: 0,
  parking_spaces: 1,
  state: 'TLAXCALA',
  municipality: 'IXTENCO',
  colony: 'BARRIO DE RESURRECCION',
};

// Definir las opciones de características disponibles
const featureOptions = [
  { value: 'Jardín amplio', label: 'Jardín amplio' },
  { value: 'Terraza', label: 'Terraza' },
  { value: 'Cisterna', label: 'Cisterna' },
  { value: 'Cocina equipada', label: 'Cocina equipada' },
  { value: 'Estacionamiento techado', label: 'Estacionamiento techado' },
  { value: 'Roof Garden', label: 'Roof Garden' },
  { value: 'Área de lavado', label: 'Área de lavado' },
  { value: 'Portón eléctrico', label: 'Portón eléctrico' },
  { value: 'Sala de TV', label: 'Sala de TV' },
  { value: 'Bodega', label: 'Bodega' }
];

// Definir las opciones de tipos de propiedad
const propertyTypeOptions: PropertyTypeOption[] = [
  { value: 1, label: 'Casa habitacional' },
  { value: 2, label: 'Casa habitacional' },
  { value: 3, label: 'Departamentos' },
  { value: 4, label: 'Casas' },
  { value: 5, label: 'Terrenos' },
  { value: 6, label: 'Bodegas' },
  { value: 7, label: 'Nave industrial' },
  { value: 8, label: 'Finca' },
  { value: 9, label: 'Local comercial' },
  { value: 10, label: 'Edificio' },
  { value: 11, label: 'Predio rústico' },
  { value: 12, label: 'Terreno agrícola' },
  { value: 13, label: 'Rancho ganadero' },
  { value: 14, label: 'Cine' },
  { value: 15, label: 'Terreno' },
  { value: 16, label: 'Escuela' },
  { value: 17, label: 'Otro' }
];

// Definir las opciones de tipos de venta
const saleTypeOptions: SaleTypeOption[] = [
  { value: 1, label: 'Cesión de derechos adjudicatarios' },
  { value: 2, label: 'Cesión de derechos adjudicatarios' },
  { value: 3, label: 'Renta con opción a compra' },
  { value: 4, label: 'Cesión de derechos adjudicatarios con posesión' },
  { value: 5, label: 'Cesión de derechos de dación en pago con posesión' },
  { value: 6, label: 'Cesión de derechos de dación en pago sin posesión' },
  { value: 7, label: 'Venta en escritura con posesión' },
  { value: 8, label: 'Venta en escritura sin posesión' },
  { value: 9, label: 'Otro' }
];

// Definir las opciones de estatus legal
const legalStatusOptions: LegalStatusOption[] = [
  { value: 1, label: 'Cesión de derechos con posesión' },
  { value: 2, label: 'Cesión de derechos con posesión' },
  { value: 3, label: 'Adjudicado sin escritura sin posesión' },
  { value: 4, label: 'Adjudicado con escritura sin posesión' },
  { value: 5, label: 'Adjudicado sin escritura con posesión' },
  { value: 6, label: 'Adjudicado con escritura con posesión' },
  { value: 7, label: 'Dación en pago con escritura con posesión' },
  { value: 8, label: 'Dación en pago sin escritura con posesión' },
  { value: 9, label: 'Dación en pago con escritura sin posesión' },
  { value: 10, label: 'Dación en pago sin escritura sin posesión' },
  { value: 11, label: 'Otro' }
];

// Estilos personalizados para el componente Select de características
const featureStyles: StylesConfig<FeatureOption, true> = {
  control: (provided, state: ControlProps<FeatureOption, true>) => ({
    ...provided,
    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
    '&:hover': {
      borderColor: '#3b82f6'
    }
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#e0e7ff',
    borderRadius: '0.25rem',
    padding: '0.25rem 0.5rem',
    margin: '0.25rem',
    display: 'flex',
    alignItems: 'center'
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#4f46e5',
    fontWeight: 500
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#4f46e5',
    ':hover': {
      backgroundColor: '#c7d2fe',
      color: '#4338ca'
    }
  }),
  option: (provided, state: OptionProps<FeatureOption, true>) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#e0e7ff' : state.isFocused ? '#f3f4f6' : 'white',
    color: state.isSelected ? '#4f46e5' : '#374151',
    ':active': {
      backgroundColor: '#e0e7ff'
    }
  }),
  menu: (provided) => ({
    ...provided,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    borderRadius: '0.375rem'
  })
};

export default function PropertyForm() {
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [colonyOptions, setColonyOptions] = useState<ColonyOption[]>([]);
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const { idToken, isAuthenticated } = useFirebaseAuth();

  // Crear el bucket si no existe
  useEffect(() => {
    const createImagesBucket = async () => {
      try {
        // Verificar si el bucket existe
        const { data: buckets } = await supabase
          .storage
          .listBuckets();

        const bucketExists = buckets?.some(bucket => bucket.name === 'images');

        if (!bucketExists) {
          // Crear el bucket si no existe
          const { error } = await supabase
            .storage
            .createBucket('images', {
              public: true, // Hacer el bucket público
              fileSizeLimit: 5242880, // Límite de 5MB por archivo
            });

          if (error) {
            console.error('Error creating bucket:', error);
          }
        }
      } catch (err) {
        console.error('Error checking/creating bucket:', err);
      }
    };

    createImagesBucket();
  }, []);

  const fetchProperty = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData(data);
      }
    } catch (err) {
      console.error('Error fetching property:', err);
      setError('Failed to load property');
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProperty();
  }
  }, [id, fetchProperty]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;

    // Convert numeric fields
    if (['beds', 'baths', 'sqft'].includes(name)) {
      parsedValue = value === '' ? 0 : parseInt(value, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const removeImage = (index: number) => {
      setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      setError(null);
    }
  };

  const uploadImages = async () => {
    if (selectedFiles.length < 10) {
      setError('Please select at least 10 images');
      return;
    }

    setLoading(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `property-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
          
        uploadedUrls.push(publicUrl);
      }
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      
      setSelectedFiles([]);
      setError(null);
    } catch (err) {
      console.error('Error uploading images:', err);
      setError('Failed to upload images');
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar cambios en la selección de características
  const handleFeatureChange = (selectedOptions: MultiValue<FeatureOption>) => {
    setFormData(prev => ({
      ...prev,
      features: selectedOptions.map(option => option.value)
    }));
  };

  // Función para manejar cambios en la selección de tipo de propiedad
  const handlePropertyTypeChange = (
    selectedOption: SingleValue<PropertyTypeOption>
  ) => {
    setFormData(prev => ({
      ...prev,
      property_type_id: selectedOption ? selectedOption.value : 1
    }));
  };

  // Función para manejar cambios en la selección de tipo de venta
  const handleSaleTypeChange = (
    selectedOption: SingleValue<SaleTypeOption>
  ) => {
    setFormData(prev => ({
        ...prev,
      sale_type_id: selectedOption ? selectedOption.value : 1
    }));
  };

  // Función para manejar cambios en la selección de estatus legal
  const handleLegalStatusChange = (
    selectedOption: SingleValue<LegalStatusOption>
  ) => {
    setFormData(prev => ({
      ...prev,
      legal_status_id: selectedOption ? selectedOption.value : 1
    }));
  };

  const fetchPostalCodeData = async (postalCode: string) => {
    try {
      setPostalCodeError(null);

      if (!isAuthenticated || !idToken) {
        throw new Error('Se requiere autenticación para consultar el código postal');
      }
      
      const response = await fetch(`https://cnk-ceneka.onrender.com/api/properties/catalogs/postal_code/${postalCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al consultar el código postal');
      }

      const data = await response.json();

      // Actualizar el estado con los datos recibidos
      setFormData(prev => ({
        ...prev,
        state: data.estado,
        municipality: data.municipio,
      }));

      // Convertir las colonias en opciones para el select
      const colonies = data.colonias.map((colony: string) => ({
        value: colony,
        label: colony
      }));
      setColonyOptions(colonies);

      // Si solo hay una colonia, seleccionarla automáticamente
      if (colonies.length === 1) {
        setFormData(prev => ({
          ...prev,
          colony: colonies[0].value
        }));
      }

    } catch (err) {
      console.error('Error fetching postal code data:', err);
      setPostalCodeError(err instanceof Error ? err.message : 'Error al consultar el código postal');
      
      // Limpiar los campos relacionados en caso de error
      setFormData(prev => ({
        ...prev,
        state: '',
        municipality: '',
        colony: ''
      }));
      setColonyOptions([]);
    }
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    // Actualizar el valor en el formulario
    setFormData(prev => ({
      ...prev,
      postal_code: value
    }));

    // Limpiar error previo
    setPostalCodeError(null);

    // Si el código postal tiene 5 dígitos, hacer la consulta
    if (value.length === 5 && /^\d+$/.test(value)) {
      fetchPostalCodeData(value);
    } else if (value.length > 0) {
      // Si hay algún valor pero no es válido, mostrar mensaje
      setPostalCodeError('El código postal debe tener 5 dígitos');
    }
  };

  const handleColonyChange = (selectedOption: SingleValue<ColonyOption>) => {
    setFormData(prev => ({
      ...prev,
      colony: selectedOption ? selectedOption.value : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!isAuthenticated || !idToken) {
        throw new Error('You must be authenticated to submit properties');
      }

      // Si hay archivos seleccionados, subirlos primero
      if (selectedFiles.length > 0) {
        const uploadedUrls: string[] = [];
        
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `property-images/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);
            
          uploadedUrls.push(publicUrl);
        }
        
        // Actualizar formData con las nuevas URLs
        formData.images = [...formData.images, ...uploadedUrls];
      }

      // Validar el número total de imágenes después de la subida
      if (formData.images.length < 10) {
        throw new Error(`Debes proporcionar al menos 10 imágenes para registrar la propiedad. Tienes ${formData.images.length} imágenes.`);
      }

      // Asegurar que property_code siempre tenga el valor estático
      const formDataToSubmit = {
        ...formData,
        property_code: STATIC_PROPERTY_CODE
      };
      
      // Calculate commercial value if not provided
      const priceValue = parseFloat(formDataToSubmit.price.replace(/[^0-9.-]+/g, ''));
      const commercialValue = formDataToSubmit.commercial_value || priceValue * 1.25;
      
      // Calculate land size in square meters if not provided
      const landSize = formDataToSubmit.land_size || formDataToSubmit.sqft / 10.764;

      // Prepare the API request payload
      const apiPayload = {
        client: formDataToSubmit.client,
        property_code: formDataToSubmit.property_code,
        property_type_id: formDataToSubmit.property_type_id,
        sale_type_id: formDataToSubmit.sale_type_id,
        legal_status_id: formDataToSubmit.legal_status_id,
        price: priceValue,
        commercial_value: commercialValue,
        street: formDataToSubmit.street || formDataToSubmit.location.split(',')[0] || '',
        exterior_number: formDataToSubmit.exterior_number || 'N/A',
        postal_code: formDataToSubmit.postal_code || '00000',
        land_size: landSize,
        sqft: formDataToSubmit.sqft,
        bedrooms: formDataToSubmit.beds,
        bathrooms: formDataToSubmit.baths,
        parking_spaces: formDataToSubmit.parking_spaces,
        title: formDataToSubmit.title,
        description: formDataToSubmit.description,
        state: formDataToSubmit.state,
        municipality: formDataToSubmit.municipality,
        colony: formDataToSubmit.colony,
        features: formDataToSubmit.features,
        images: formDataToSubmit.images,
      };

      // Submit to the API
      const response = await fetch('https://cnk-ceneka.onrender.com/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create property');
      }

      // If successful, also save to Supabase for local storage
      if (id) {
        // Update existing property in Supabase
        const { error: supabaseError } = await supabase
          .from('properties')
          .update(formDataToSubmit)
          .eq('id', id);
        if (supabaseError) throw supabaseError;
      } else {
        // Create new property in Supabase
        const { error: supabaseError } = await supabase
          .from('properties')
          .insert([formDataToSubmit]);
        if (supabaseError) throw supabaseError;
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving property:', err);
      setError(err instanceof Error ? err.message : 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Titulo
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Precio
            </label>
            <input
              type="text"
              id="price"
              name="price"
              required
              value={formData.price}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="commercial_value" className="block text-sm font-medium text-gray-700">
              Valor comercial
            </label>
            <input
              type="number"
              id="commercial_value"
              name="commercial_value"
              value={formData.commercial_value}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Leave empty for auto-calculation"
            />
          </div>

          <div>
            <label htmlFor="property_type_id" className="block text-sm font-medium text-gray-700">
              Tipo de Propiedad
            </label>
            <Select<PropertyTypeOption>
              options={propertyTypeOptions}
              value={propertyTypeOptions.find(option => option.value === formData.property_type_id)}
              onChange={handlePropertyTypeChange}
              className="mt-1"
              classNamePrefix="select"
              placeholder="Selecciona un tipo de propiedad"
              isClearable={true}
              isSearchable={true}
            />
          </div>

          <div>
            <label htmlFor="sale_type_id" className="block text-sm font-medium text-gray-700">
              Tipo de Venta
            </label>
            <Select<SaleTypeOption>
              options={saleTypeOptions}
              value={saleTypeOptions.find(option => option.value === formData.sale_type_id)}
              onChange={handleSaleTypeChange}
              className="mt-1"
              classNamePrefix="select"
              placeholder="Selecciona un tipo de venta"
              isClearable={true}
              isSearchable={true}
            />
          </div>

          <div>
            <label htmlFor="legal_status_id" className="block text-sm font-medium text-gray-700">
              Estatus Legal
            </label>
            <Select<LegalStatusOption>
              options={legalStatusOptions}
              value={legalStatusOptions.find(option => option.value === formData.legal_status_id)}
              onChange={handleLegalStatusChange}
              className="mt-1"
              classNamePrefix="select"
              placeholder="Selecciona un estatus legal"
              isClearable={true}
              isSearchable={true}
            />
          </div>

          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700">
              Calle
            </label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="exterior_number" className="block text-sm font-medium text-gray-700">
              Número Exterior
            </label>
            <input
              type="text"
              id="exterior_number"
              name="exterior_number"
              value={formData.exterior_number}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
              Código Postal
            </label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handlePostalCodeChange}
              maxLength={5}
              pattern="[0-9]*"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Ingresa el código postal"
            />
            {postalCodeError && (
              <p className="mt-1 text-sm text-red-600">{postalCodeError}</p>
            )}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Ubicación
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="land_size" className="block text-sm font-medium text-gray-700">
              Tamaño del Terreno (m²)
            </label>
            <input
              type="number"
              id="land_size"
              name="land_size"
              value={formData.land_size}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Se calculará automáticamente"
            />
          </div>

          <div>
            <label htmlFor="beds" className="block text-sm font-medium text-gray-700">
              Recámaras
            </label>
            <input
              type="number"
              id="beds"
              name="beds"
              required
              min="0"
              value={formData.beds}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="baths" className="block text-sm font-medium text-gray-700">
              Baños
            </label>
            <input
              type="number"
              id="baths"
              name="baths"
              required
              min="0"
              value={formData.baths}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="sqft" className="block text-sm font-medium text-gray-700">
              Metros Cuadrados
            </label>
            <input
              type="number"
              id="sqft"
              name="sqft"
              required
              min="0"
              value={formData.sqft}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="parking_spaces" className="block text-sm font-medium text-gray-700">
              Espacios de Estacionamiento
            </label>
            <input
              type="number"
              id="parking_spaces"
              name="parking_spaces"
              min="0"
              value={formData.parking_spaces}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="municipality" className="block text-sm font-medium text-gray-700">
              Municipio
            </label>
            <input
              type="text"
              id="municipality"
              name="municipality"
              value={formData.municipality}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="colony" className="block text-sm font-medium text-gray-700">
              Colonia
            </label>
            <Select<ColonyOption>
              options={colonyOptions}
              value={colonyOptions.find(option => option.value === formData.colony)}
              onChange={handleColonyChange}
              className="mt-1"
              classNamePrefix="select"
              placeholder="Selecciona una colonia"
              isClearable={true}
              isSearchable={true}
              isDisabled={colonyOptions.length === 0}
            />
            {colonyOptions.length === 0 && formData.postal_code && !postalCodeError && (
              <p className="mt-1 text-sm text-gray-500">
                Ingresa un código postal válido para ver las colonias disponibles
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Características
          </label>
          <Select
            isMulti
            options={featureOptions}
            value={featureOptions.filter(option => formData.features.includes(option.value))}
            onChange={handleFeatureChange}
            styles={featureStyles}
            className="mt-1"
            classNamePrefix="select"
            placeholder="Selecciona las características de la propiedad"
            noOptionsMessage={() => "No hay opciones disponibles"}
            isClearable={true}
            isSearchable={true}
          />
          <p className="mt-2 text-sm text-gray-500">
            Selecciona una o varias características. Puedes buscar escribiendo en el campo.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Additional Images</label>
          <div className="mt-1">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
            {selectedFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">{selectedFiles.length} files selected</p>
            <button
              type="button"
                  onClick={uploadImages}
                  disabled={loading || selectedFiles.length < 10}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                  {loading ? 'Uploading...' : 'Upload Images'}
            </button>
              </div>
            )}
            {error && selectedFiles.length < 10 && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Property ${index + 1}`}
                  className="h-24 w-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-white/80 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : id ? 'Update Property' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
}