import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Legend from './components/Legend';
import Optionsfield from './components/Optionsfield';
import './Map.css';
import data from './data.json';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN

const Map = () => {
    // 表示オプションのベタ書き
    const options = [
        {
            name: 'Population',
            description: 'Estimated total population',
            property: 'pop_est',
            stops: [
                [0, '#f8d5cc'],
                [1000000, '#f4bfb6'],
                [5000000, '#f1a8a5'],
                [10000000, '#ee8f9a'],
                [50000000, '#ec739b'],
                [100000000, '#dd5ca8'],
                [250000000, '#c44cc0'],
                [500000000, '#9f43d7'],
                [1000000000, '#6e40e6']
            ]
        },
        {
            name: 'GDP',
            description: 'Estimate total GDP in millions of dollars',
            property: 'gdp_md_est',
            stops: [
                [0, '#f8d5cc'],
                [1000, '#f4bfb6'],
                [5000, '#f1a8a5'],
                [10000, '#ee8f9a'],
                [50000, '#ec739b'],
                [100000, '#dd5ca8'],
                [250000, '#c44cc0'],
                [5000000, '#9f43d7'],
                [10000000, '#6e40e6']
            ]
        }
    ];


    const mapContainerRef = useRef(null);
    const [lng, setLng] = useState(138);
    const [lat, setLat] = useState(38);
    const [zoom, setZoom] = useState(4);
    const [active, setActive] = useState(options[0])
    const [map, setMap] = useState(null)

    // mapのinitialize
    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/satellite-streets-v11',
            center: [lng, lat],
            zoom: zoom
        });

        // Add navigation control (the +/- zoom buttons)
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // mapをloadした時に稼働する
        map.on('load', () => {
            // Layerの大元となるソースを定義
            map.addSource('countries', {
                type: 'geojson',
                data: data
            });

            // オーバレイさせるLayerのLayout設定
            // https://docs.mapbox.com/mapbox-gl-js/api/map/#map#setlayoutproperty
            // 国名の表示のさせ方
            // 最初のstyleでLayer自体は定義されているっぽい
            map.setLayoutProperty('country-label', 'text-field', [
                'format',
                ['get', 'name_en'],
                { 'font-scale': 1.2 },
                '\n',
                {},
                ['get', 'name'],
                {
                    'font-scale': 0.8,
                    'text-font': [
                        'literal',
                        ['DIN Offc Pro Italic', 'Arial Unicode MS Regular']
                    ]
                }
            ]);

            // Layerの追加
            map.addLayer(
                {
                    id: 'countries',
                    type: 'fill',
                    source: 'countries',
                },
                'country-label' // Add the layer before the existing `country-label` layer
            );

            // optionsとして設定したデータの選択
            map.setPaintProperty('countries', 'fill-color', {
                property: active.property,
                stops: active.stops
            });

            setMap(map)
        })

        // mapが動いた時に稼働する
        map.on('move', () => {
            setLng(map.getCenter().lng.toFixed(4)); // getCenter: 地図の中心にあるポイントの新しい経度と緯度を取得
            setLat(map.getCenter().lat.toFixed(4)); // toFixed: 桁数切り上げ
            setZoom(map.getZoom().toFixed(2)); // getZoom: 地図に設定されているズームレベルを決定
        });

        // Clean up on unmount
        return () => map.remove();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    // optionsの描画
    const paint = () => {
        if (map) {
            map.setPaintProperty('countries', 'fill-color', {
                property: active.property,
                stops: active.stops
            })
        }
    }

    // optionsのデータが変わるたびに描画し直すためのeffect
    useEffect(() => {
        paint();
    }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

    // optionを変更するための関数
    const changeState = i => {
        setActive(options[i]);
        // この下不要？
        map.setPaintProperty('countries', 'fill-color', {
            property: active.property,
            stops: active.stops
        });
    };

    return (
        <div>
            <div className="sidebar">
                Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
            <Legend active={active} stops={active.stops} />
            <Optionsfield
                options={options}
                property={active.property}
                changeState={changeState}
            />
            <div className='map-container' ref={mapContainerRef} />
        </div>
    );
};

export default Map;
