import React, { useEffect, useMemo, useState } from 'react';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Box, Button, FormControl, MenuItem, Select, Typography } from '@mui/material';
import { NajisplatliviPodmoduliInterface } from '../interfaces/NajisplatliviPodmoduliInterface';
import { Link } from "./LinkBase";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, zoomPlugin);

const chartTitleSx = () => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    paddingBottom: 4,
    color: '#32355c',
});

const NajisplatliviPodmoduli: React.FC = () => {
    const [data, setData] = useState<NajisplatliviPodmoduliInterface[]>([]);
    const [filteredData, setFilteredData] = useState<NajisplatliviPodmoduliInterface[]>([]);
    const [showModul, setShowModule] = useState<string>('default');

    useEffect(() => {
        fetch(`${Link}/api/DataStatistics/NajisplativiPodmoduli`, {
            method: 'GET',
            headers: new Headers({
                'Access-Control-Allow-Origin': '*',
                'ngrok-skip-browser-warning': '69420',
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new TypeError('Received content is not JSON');
                }
                return response.json();
            })
            .then((data: NajisplatliviPodmoduliInterface[]) => {
                setData(data);
                setFilteredData(data);
            })
            .catch((err) => console.error('Error fetching data:', err));
    }, []);

    const transformedData = useMemo(() => {
        const groupedData = filteredData.reduce((accumulator, entry) => {
            const modul = entry.nazivModul;
            const podmodul = entry.nazivPodModul;

            const label = `${modul}\n${podmodul}`;

            if (!accumulator[label]) {
                accumulator[label] = { denari: 0, poeni: 0 };
            }

            accumulator[label].denari += entry.vkupno_Denari;
            accumulator[label].poeni += entry.vkupno_Poeni;

            return accumulator;
        }, {} as { [modul: string]: { denari: number; poeni: number } });

        return groupedData;
    }, [filteredData]);

    const chartData = useMemo(() => {
        const labels = Object.keys(transformedData);
        const poeniData = Object.values(transformedData).map((entry) => entry.poeni);
        const denariData = Object.values(transformedData).map((entry) => entry.denari);

        if (showModul === 'default') {
            return {
                labels,
                datasets: [
                    {
                        label: 'Поени',
                        data: poeniData,
                        backgroundColor: 'rgb(41, 176, 190)',
                        minBarLength: 10,
                    },
                    {
                        label: 'Денари',
                        data: denariData,
                        backgroundColor: 'rgb(255, 131, 41)',
                        minBarLength: 10,
                    },
                ],
            };
        } else {
            const filteredSubmodules = data
                .filter((entry) => entry.nazivModul === showModul)
                .map((entry) => entry.nazivPodModul);
            return {
                labels: filteredSubmodules,
                datasets: [
                    {
                        label: 'Поени',
                        data: data
                            .filter((entry) => entry.nazivModul === showModul)
                            .map((entry) => entry.vkupno_Poeni),
                        backgroundColor: 'rgb(41, 176, 190)',
                        minBarLength: 10,
                    },
                    {
                        label: 'Денари',
                        data: data
                            .filter((entry) => entry.nazivModul === showModul)
                            .map((entry) => entry.vkupno_Denari),
                        backgroundColor: 'rgb(255, 131, 41)',
                        minBarLength: 10,
                    },
                ],
            };
        }
    }, [transformedData, showModul]);

    const options = useMemo(() => {
        const uniqueModules = new Set<string>();
        data.forEach((entry) => uniqueModules.add(entry.nazivModul));
        return Array.from(uniqueModules);
    }, [data]);

    const filterModule = () => {
        if (showModul === 'default') {
            setFilteredData(data);
        } else {
            setFilteredData(data.filter((entry) => entry.nazivModul === showModul));
        }
    };

    useEffect(() => {
        filterModule();
    }, [showModul]);

    const chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        indexAxis: 'y',
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#32355c',
                },
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Количина на платежни средства',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Модули и подмодули',
                },
                ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    font: {
                        size: 9,
                    },
                },
            },
        },
    };

    return (
        <>
            <Typography component="label" variant="body2" sx={chartTitleSx()}>
                Најисплатливи подмодули
            </Typography>
            <Box>
                <FormControl>
                    <Select
                        className="select"
                        onChange={(event) => setShowModule(event.target.value)}
                        value={showModul}
                        sx={{ color: '#32355c', borderColor: '#32355c' }}
                    >
                        <MenuItem value="default" disabled>
                            Прикажи модул
                        </MenuItem>
                        {options.map((option) => (
                            <MenuItem key={option} value={option} sx={{ color: '#32355c', borderColor: '#32355c' }}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    onClick={() => setShowModule('default')}
                    variant="contained"
                    sx={{ marginLeft: 2, backgroundColor: 'rgb(41, 176, 190)', padding: '15px' }}
                >
                    Приказ на сите модули
                </Button>
            </Box>
            <Bar data={chartData} options={chartOptions} height={200} />
        </>
    );
};

export default NajisplatliviPodmoduli;
